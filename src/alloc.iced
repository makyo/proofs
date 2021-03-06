
web_service = require './web_service'
{Untrack,Track} = require './track'
{Auth} = require './auth'
{Revoke} = require './revoke'

#=======================================================

get_klass = (type) ->
  err = klass = null
  klass = switch type
    when "web_service_binding.twitter" then web_service.TwitterBinding
    when "web_service_binding.github"  then web_service.GithubBinding
    when "web_service_binding.keybase" then web_service.KeybaseBinding
    when "track"                       then Track
    when "untrack"                     then Untrack
    when "auth"                        then Auth
    when "revoke"                      then Revoke
    else  
      err = new Error "Unknown proof class: #{type}"
      null
  [err, klass]

#=======================================================

alloc = (type, args) ->
  ret = null
  [err, klass] = get_klass type
  if klass?
    ret = new klass args
  ret

#=======================================================

exports.get_klass = get_klass
exports.alloc = alloc

#=======================================================

