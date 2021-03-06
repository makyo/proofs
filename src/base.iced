{constants} = require './constants'
pgp_utils = require('pgp-utils')
{katch,akatch,bufeq_secure,json_stringify_sorted,unix_time,base64u,streq_secure} = pgp_utils.util
triplesec = require('triplesec')
{WordArray} = triplesec
{SHA256} = triplesec.hash
{decode} = pgp_utils.armor
{make_esc} = require 'iced-error'
util = require 'util'

#==========================================================================

exports.hash_sig = hash_sig = (sig_body) ->
  (new SHA256).bufhash(sig_body)

#------

add_ids = (sig_body, out) ->
  hash = hash_sig sig_body
  id = hash.toString('hex')
  short_id = sig_id_to_short_id hash
  out.id = id
  out.short_id = short_id

#------

make_ids = (sig_body) -> 
  out = {}
  add_ids sig_body, out
  return out

#------

sig_id_to_short_id = (sig_id) ->
  base64u.encode sig_id[0...constants.short_id_bytes]

#==========================================================================

class Verifier 

  constructor : ({@pgp, @id, @short_id, @skip_ids, @make_ids}, @sig_eng, @base) ->

  #---------------

  km : () -> @sig_eng.get_km()

  #---------------

  verify : (cb) ->
    esc = make_esc cb, "Verifier::verfiy"
    await @_parse_and_process esc defer()
    await @_check_json esc defer json_obj, json_str
    await @_check_expired esc defer()
    cb null, json_obj, json_str

  #---------------

  _check_ids : (body, cb) ->
    {short_id, id} = make_ids body
    err = if not streq_secure id, @id
      new Error "Long IDs aren't equal; wanted #{id} but got #{@id}"
    else if not streq_secure short_id, @short_id
      new Error "Short IDs aren't equal: wanted #{short_id} but got #{@short_id}"
    else null
    cb err

  #---------------

  _check_expired : (cb) ->
    now = unix_time()
    expired = (now - @json.ctime - @json.expire_in)
    err = if expired > 0 then new Error "Expired #{expired}s ago"
    else null
    cb err

  #---------------

  _parse_and_process : (cb) ->
    err = null
    [ err, msg] = decode @pgp
    if not err? and (msg.type isnt "MESSAGE")
      err = new Error "wrong message type; expected a generic message; got #{msg.type}"
    if not err? and not @skip_ids
      await @_check_ids msg.body, defer err
    if not err? and @make_ids
      {@short_id, @id} = make_ids msg.body
    if not err?
      await @sig_eng.unbox msg, defer err, @literals
    cb err

  #---------------

  _check_json : (cb) -> 
    err = @json = jsons = null
    if (n = @literals.length) isnt 1
      err = new Error "Expected only one pgp literal; got #{n}"
    else 
      l = @literals[0]
      jsons = l.data
      [e, @json] = katch (() -> JSON.parse jsons)
      err = new Error "Couldn't parse JSON signed message: #{e.message}" if e?
    if not err?
      jsons = jsons.toString('utf8')
      await @base._v_check {@json}, defer err
      if err? then #noop
      else if not (sw = l.get_data_signer()?.sig)?
        err = new Error "Expected a signature on the payload message"
      else if not (@km().find_pgp_key (b = sw.get_key_id()))?
        err = new Error "Failed sanity check; didn't have a key for '#{b.toString('hex')}'"
    cb err, @json, jsons

#==========================================================================

class Base

  #------

  constructor : ({@sig_eng, @seqno, @user, @host, @prev}) ->

  #------

  _v_check : ({json}, cb) -> 
    err = if (a = json?.body?.key?.username) isnt (b = @user.local.username)
      new Error "Wrong local user: got '#{a}' but wanted '#{b}'"
    else if (a = json?.body?.key?.uid) isnt (b = @user.local.uid)
      new Error "Wrong local uid: got '#{a}' but wanted '#{b}'"
    else if not (kid = json?.body?.key?.key_id)?
      new Error "Needed a body.key.key_id but none given"
    else if not bufeq_secure @km().get_pgp_key_id(), (new Buffer kid, "hex")
      new Error "Verification key doesn't match packet (via key ID)"
    else if not (fp = json?.body?.key?.fingerprint)?
      new Error "Needed a body.key.fingerprint but none given"
    else if not bufeq_secure @km().get_pgp_fingerprint(), (new Buffer fp, "hex")
      new Error "Verifiation key doesn't match packet (via fingerprint)"
    else if (a = json?.body?.key?.host) isnt (b = @host)
      new Error "Wrong host: got '#{a}' but wanted '#{b}'"
    else if (a = json?.body?.type) isnt (b = @_type())
      new Error "Wrong signature type; got '#{a}' but wanted '#{b}'"
    else if (a = @prev) and (a isnt (b = json?.prev))
      new Error "Wrong previous hash; wanted '#{a}' but got '#{b}'"
    else if (a = @seqno) and (a isnt (b = json?.seqno))
      new Error "Wrong seqno; wanted '#{a}' but got '#{b}"
    else
      null
    cb err

  #------

  is_remote_proof : () -> false

  #------

  _json : ({expire_in}) ->
    ret = { 
      seqno : @seqno
      prev : @prev
      ctime : unix_time()
      tag : constants.tags.sig
      expire_in : expire_in or constants.expire_in
      body : 
        version : constants.versions.sig
        type : @_type()
        key :
          host : @host
          username : @user.local.username
          uid : @user.local.uid
          key_id : @km().get_pgp_key_id().toString('hex')
          fingerprint : @km().get_pgp_fingerprint().toString('hex')
    }
    return ret

  #------

  json : -> json_stringify_sorted @_json()

  #------

  generate : (cb) ->
    out = null
    json = @json()
    await @sig_eng.box json, defer err, {pgp, raw}
    unless err?
      {short_id, id} = make_ids raw
      out = { pgp, json, id, short_id, raw }
    cb err, out

  #------

  # @param {Object} obj with options as specified:
  # @option obj {string} pgp The PGP signature that's being uploaded
  # @option obj {string} id The keybase-appropriate ID that's the PGP signature's hash
  # @option obj {string} short_id The shortened sig ID that's for the tweet (or similar)
  # @option obj {bool} skip_ids Don't bother checking IDs
  # @option obj {bool} make_ids Make Ids when verifying
  verify : (obj, cb) ->
    verifier = new Verifier obj, @sig_eng, @
    await verifier.verify defer err, json_obj, json_str
    id = short_id = null
    if obj.make_ids
      id = obj.id = verifier.id
      short_id = obj.short_id = verifier.short_id
    out = if err? then {}
    else { json_obj, json_str, id, short_id }
    cb err, out

  #-------
  
  km : () -> @sig_eng.get_km()

#==========================================================================

exports.Base = Base
exports.sig_id_to_short_id = sig_id_to_short_id
exports.make_ids = make_ids
exports.add_ids = add_ids

#==========================================================================

