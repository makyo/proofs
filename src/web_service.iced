{Base} = require './base'
{constants} = require './constants'

#==========================================================================

class WebServiceBinding extends Base

  #------

  _json : () ->
    ret = super {}
    ret.body.service = o if (o = @service_obj())?
    return ret

  #---------------

  _service_obj_check : (x) -> return not(x?)

  #---------------

  _type : () -> constants.sig_types.web_service_binding

  #---------------

  _v_check : ({json}, cb) -> 
    await super { json }, defer err
    unless err?
      err = if not @_service_obj_check json?.body?.service 
        new Error "Bad service object found"
    cb err

#==========================================================================

class RemoteBinding extends WebServiceBinding

  _service_obj_check : (x) ->
    so = @service_obj()
    return (x? and (so.username is x.username) and (so.name is x.name))

  service_obj  : -> { name : @service_name(), username : @user.remote }
  is_remote_proof : () -> true

#==========================================================================

class TwitterBinding extends RemoteBinding

  service_name : -> "twitter"
  proof_type   : -> constants.proof_types.twitter

#==========================================================================

class KeybaseBinding extends WebServiceBinding

  _service_obj_check : (x) -> not x?
  service_name       : -> "keybase"
  proof_type         : -> constants.proof_types.keybase
  service_obj        : ->  null

#==========================================================================

class GithubBinding extends RemoteBinding
  service_name : -> "github"
  proof_type   : -> constants.proof_types.github

#==========================================================================

exports.TwitterBinding = TwitterBinding
exports.KeybaseBinding = KeybaseBinding
exports.GithubBinding = GithubBinding

#==========================================================================
