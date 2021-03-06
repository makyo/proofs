// Generated by IcedCoffeeScript 1.7.1-a
(function() {
  var Base, SHA256, Verifier, WordArray, add_ids, akatch, base64u, bufeq_secure, constants, decode, hash_sig, iced, json_stringify_sorted, katch, make_esc, make_ids, pgp_utils, sig_id_to_short_id, streq_secure, triplesec, unix_time, util, __iced_k, __iced_k_noop, _ref;

  iced = require('iced-coffee-script/lib/coffee-script/iced').runtime;
  __iced_k = __iced_k_noop = function() {};

  constants = require('./constants').constants;

  pgp_utils = require('pgp-utils');

  _ref = pgp_utils.util, katch = _ref.katch, akatch = _ref.akatch, bufeq_secure = _ref.bufeq_secure, json_stringify_sorted = _ref.json_stringify_sorted, unix_time = _ref.unix_time, base64u = _ref.base64u, streq_secure = _ref.streq_secure;

  triplesec = require('triplesec');

  WordArray = triplesec.WordArray;

  SHA256 = triplesec.hash.SHA256;

  decode = pgp_utils.armor.decode;

  make_esc = require('iced-error').make_esc;

  util = require('util');

  exports.hash_sig = hash_sig = function(sig_body) {
    return (new SHA256).bufhash(sig_body);
  };

  add_ids = function(sig_body, out) {
    var hash, id, short_id;
    hash = hash_sig(sig_body);
    id = hash.toString('hex');
    short_id = sig_id_to_short_id(hash);
    out.id = id;
    return out.short_id = short_id;
  };

  make_ids = function(sig_body) {
    var out;
    out = {};
    add_ids(sig_body, out);
    return out;
  };

  sig_id_to_short_id = function(sig_id) {
    return base64u.encode(sig_id.slice(0, constants.short_id_bytes));
  };

  Verifier = (function() {
    function Verifier(_arg, sig_eng, base) {
      this.pgp = _arg.pgp, this.id = _arg.id, this.short_id = _arg.short_id, this.skip_ids = _arg.skip_ids, this.make_ids = _arg.make_ids;
      this.sig_eng = sig_eng;
      this.base = base;
    }

    Verifier.prototype.km = function() {
      return this.sig_eng.get_km();
    };

    Verifier.prototype.verify = function(cb) {
      var esc, json_obj, json_str, ___iced_passed_deferral, __iced_deferrals, __iced_k;
      __iced_k = __iced_k_noop;
      ___iced_passed_deferral = iced.findDeferral(arguments);
      esc = make_esc(cb, "Verifier::verfiy");
      (function(_this) {
        return (function(__iced_k) {
          __iced_deferrals = new iced.Deferrals(__iced_k, {
            parent: ___iced_passed_deferral,
            filename: "/Users/max/src/keybase/proofs/src/base.iced",
            funcname: "Verifier.verify"
          });
          _this._parse_and_process(esc(__iced_deferrals.defer({
            lineno: 50
          })));
          __iced_deferrals._fulfill();
        });
      })(this)((function(_this) {
        return function() {
          (function(__iced_k) {
            __iced_deferrals = new iced.Deferrals(__iced_k, {
              parent: ___iced_passed_deferral,
              filename: "/Users/max/src/keybase/proofs/src/base.iced",
              funcname: "Verifier.verify"
            });
            _this._check_json(esc(__iced_deferrals.defer({
              assign_fn: (function() {
                return function() {
                  json_obj = arguments[0];
                  return json_str = arguments[1];
                };
              })(),
              lineno: 51
            })));
            __iced_deferrals._fulfill();
          })(function() {
            (function(__iced_k) {
              __iced_deferrals = new iced.Deferrals(__iced_k, {
                parent: ___iced_passed_deferral,
                filename: "/Users/max/src/keybase/proofs/src/base.iced",
                funcname: "Verifier.verify"
              });
              _this._check_expired(esc(__iced_deferrals.defer({
                lineno: 52
              })));
              __iced_deferrals._fulfill();
            })(function() {
              return cb(null, json_obj, json_str);
            });
          });
        };
      })(this));
    };

    Verifier.prototype._check_ids = function(body, cb) {
      var err, id, short_id, _ref1;
      _ref1 = make_ids(body), short_id = _ref1.short_id, id = _ref1.id;
      err = !streq_secure(id, this.id) ? new Error("Long IDs aren't equal; wanted " + id + " but got " + this.id) : !streq_secure(short_id, this.short_id) ? new Error("Short IDs aren't equal: wanted " + short_id + " but got " + this.short_id) : null;
      return cb(err);
    };

    Verifier.prototype._check_expired = function(cb) {
      var err, expired, now;
      now = unix_time();
      expired = now - this.json.ctime - this.json.expire_in;
      err = expired > 0 ? new Error("Expired " + expired + "s ago") : null;
      return cb(err);
    };

    Verifier.prototype._parse_and_process = function(cb) {
      var err, msg, ___iced_passed_deferral, __iced_deferrals, __iced_k, _ref1;
      __iced_k = __iced_k_noop;
      ___iced_passed_deferral = iced.findDeferral(arguments);
      err = null;
      _ref1 = decode(this.pgp), err = _ref1[0], msg = _ref1[1];
      if ((err == null) && (msg.type !== "MESSAGE")) {
        err = new Error("wrong message type; expected a generic message; got " + msg.type);
      }
      (function(_this) {
        return (function(__iced_k) {
          if ((err == null) && !_this.skip_ids) {
            (function(__iced_k) {
              __iced_deferrals = new iced.Deferrals(__iced_k, {
                parent: ___iced_passed_deferral,
                filename: "/Users/max/src/keybase/proofs/src/base.iced",
                funcname: "Verifier._parse_and_process"
              });
              _this._check_ids(msg.body, __iced_deferrals.defer({
                assign_fn: (function() {
                  return function() {
                    return err = arguments[0];
                  };
                })(),
                lineno: 83
              }));
              __iced_deferrals._fulfill();
            })(__iced_k);
          } else {
            return __iced_k();
          }
        });
      })(this)((function(_this) {
        return function() {
          var _ref2;
          if ((err == null) && _this.make_ids) {
            _ref2 = make_ids(msg.body), _this.short_id = _ref2.short_id, _this.id = _ref2.id;
          }
          (function(__iced_k) {
            if (err == null) {
              (function(__iced_k) {
                __iced_deferrals = new iced.Deferrals(__iced_k, {
                  parent: ___iced_passed_deferral,
                  filename: "/Users/max/src/keybase/proofs/src/base.iced",
                  funcname: "Verifier._parse_and_process"
                });
                _this.sig_eng.unbox(msg, __iced_deferrals.defer({
                  assign_fn: (function(__slot_1) {
                    return function() {
                      err = arguments[0];
                      return __slot_1.literals = arguments[1];
                    };
                  })(_this),
                  lineno: 87
                }));
                __iced_deferrals._fulfill();
              })(__iced_k);
            } else {
              return __iced_k();
            }
          })(function() {
            return cb(err);
          });
        };
      })(this));
    };

    Verifier.prototype._check_json = function(cb) {
      var b, e, err, jsons, l, n, sw, ___iced_passed_deferral, __iced_deferrals, __iced_k, _ref1;
      __iced_k = __iced_k_noop;
      ___iced_passed_deferral = iced.findDeferral(arguments);
      err = this.json = jsons = null;
      if ((n = this.literals.length) !== 1) {
        err = new Error("Expected only one pgp literal; got " + n);
      } else {
        l = this.literals[0];
        jsons = l.data;
        _ref1 = katch((function() {
          return JSON.parse(jsons);
        })), e = _ref1[0], this.json = _ref1[1];
        if (e != null) {
          err = new Error("Couldn't parse JSON signed message: " + e.message);
        }
      }
      (function(_this) {
        return (function(__iced_k) {
          if (err == null) {
            jsons = jsons.toString('utf8');
            (function(__iced_k) {
              __iced_deferrals = new iced.Deferrals(__iced_k, {
                parent: ___iced_passed_deferral,
                filename: "/Users/max/src/keybase/proofs/src/base.iced",
                funcname: "Verifier._check_json"
              });
              _this.base._v_check({
                json: _this.json
              }, __iced_deferrals.defer({
                assign_fn: (function() {
                  return function() {
                    return err = arguments[0];
                  };
                })(),
                lineno: 103
              }));
              __iced_deferrals._fulfill();
            })(function() {
              var _ref2;
              return __iced_k(err != null ? void 0 : (sw = (_ref2 = l.get_data_signer()) != null ? _ref2.sig : void 0) == null ? err = new Error("Expected a signature on the payload message") : (_this.km().find_pgp_key((b = sw.get_key_id()))) == null ? err = new Error("Failed sanity check; didn't have a key for '" + (b.toString('hex')) + "'") : void 0);
            });
          } else {
            return __iced_k();
          }
        });
      })(this)((function(_this) {
        return function() {
          return cb(err, _this.json, jsons);
        };
      })(this));
    };

    return Verifier;

  })();

  Base = (function() {
    function Base(_arg) {
      this.sig_eng = _arg.sig_eng, this.seqno = _arg.seqno, this.user = _arg.user, this.host = _arg.host, this.prev = _arg.prev;
    }

    Base.prototype._v_check = function(_arg, cb) {
      var a, b, err, fp, json, kid, _ref1, _ref10, _ref11, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9;
      json = _arg.json;
      err = (a = json != null ? (_ref1 = json.body) != null ? (_ref2 = _ref1.key) != null ? _ref2.username : void 0 : void 0 : void 0) !== (b = this.user.local.username) ? new Error("Wrong local user: got '" + a + "' but wanted '" + b + "'") : (a = json != null ? (_ref3 = json.body) != null ? (_ref4 = _ref3.key) != null ? _ref4.uid : void 0 : void 0 : void 0) !== (b = this.user.local.uid) ? new Error("Wrong local uid: got '" + a + "' but wanted '" + b + "'") : (kid = json != null ? (_ref5 = json.body) != null ? (_ref6 = _ref5.key) != null ? _ref6.key_id : void 0 : void 0 : void 0) == null ? new Error("Needed a body.key.key_id but none given") : !bufeq_secure(this.km().get_pgp_key_id(), new Buffer(kid, "hex")) ? new Error("Verification key doesn't match packet (via key ID)") : (fp = json != null ? (_ref7 = json.body) != null ? (_ref8 = _ref7.key) != null ? _ref8.fingerprint : void 0 : void 0 : void 0) == null ? new Error("Needed a body.key.fingerprint but none given") : !bufeq_secure(this.km().get_pgp_fingerprint(), new Buffer(fp, "hex")) ? new Error("Verifiation key doesn't match packet (via fingerprint)") : (a = json != null ? (_ref9 = json.body) != null ? (_ref10 = _ref9.key) != null ? _ref10.host : void 0 : void 0 : void 0) !== (b = this.host) ? new Error("Wrong host: got '" + a + "' but wanted '" + b + "'") : (a = json != null ? (_ref11 = json.body) != null ? _ref11.type : void 0 : void 0) !== (b = this._type()) ? new Error("Wrong signature type; got '" + a + "' but wanted '" + b + "'") : (a = this.prev) && (a !== (b = json != null ? json.prev : void 0)) ? new Error("Wrong previous hash; wanted '" + a + "' but got '" + b + "'") : (a = this.seqno) && (a !== (b = json != null ? json.seqno : void 0)) ? new Error("Wrong seqno; wanted '" + a + "' but got '" + b) : null;
      return cb(err);
    };

    Base.prototype.is_remote_proof = function() {
      return false;
    };

    Base.prototype._json = function(_arg) {
      var expire_in, ret;
      expire_in = _arg.expire_in;
      ret = {
        seqno: this.seqno,
        prev: this.prev,
        ctime: unix_time(),
        tag: constants.tags.sig,
        expire_in: expire_in || constants.expire_in,
        body: {
          version: constants.versions.sig,
          type: this._type(),
          key: {
            host: this.host,
            username: this.user.local.username,
            uid: this.user.local.uid,
            key_id: this.km().get_pgp_key_id().toString('hex'),
            fingerprint: this.km().get_pgp_fingerprint().toString('hex')
          }
        }
      };
      return ret;
    };

    Base.prototype.json = function() {
      return json_stringify_sorted(this._json());
    };

    Base.prototype.generate = function(cb) {
      var err, id, json, out, pgp, raw, short_id, ___iced_passed_deferral, __iced_deferrals, __iced_k;
      __iced_k = __iced_k_noop;
      ___iced_passed_deferral = iced.findDeferral(arguments);
      out = null;
      json = this.json();
      (function(_this) {
        return (function(__iced_k) {
          __iced_deferrals = new iced.Deferrals(__iced_k, {
            parent: ___iced_passed_deferral,
            filename: "/Users/max/src/keybase/proofs/src/base.iced",
            funcname: "Base.generate"
          });
          _this.sig_eng.box(json, __iced_deferrals.defer({
            assign_fn: (function() {
              return function() {
                err = arguments[0];
                pgp = arguments[1].pgp;
                return raw = arguments[1].raw;
              };
            })(),
            lineno: 180
          }));
          __iced_deferrals._fulfill();
        });
      })(this)((function(_this) {
        return function() {
          var _ref1;
          if (typeof err === "undefined" || err === null) {
            _ref1 = make_ids(raw), short_id = _ref1.short_id, id = _ref1.id;
            out = {
              pgp: pgp,
              json: json,
              id: id,
              short_id: short_id,
              raw: raw
            };
          }
          return cb(err, out);
        };
      })(this));
    };

    Base.prototype.verify = function(obj, cb) {
      var err, id, json_obj, json_str, out, short_id, verifier, ___iced_passed_deferral, __iced_deferrals, __iced_k;
      __iced_k = __iced_k_noop;
      ___iced_passed_deferral = iced.findDeferral(arguments);
      verifier = new Verifier(obj, this.sig_eng, this);
      (function(_this) {
        return (function(__iced_k) {
          __iced_deferrals = new iced.Deferrals(__iced_k, {
            parent: ___iced_passed_deferral,
            filename: "/Users/max/src/keybase/proofs/src/base.iced",
            funcname: "Base.verify"
          });
          verifier.verify(__iced_deferrals.defer({
            assign_fn: (function() {
              return function() {
                err = arguments[0];
                json_obj = arguments[1];
                return json_str = arguments[2];
              };
            })(),
            lineno: 196
          }));
          __iced_deferrals._fulfill();
        });
      })(this)((function(_this) {
        return function() {
          id = short_id = null;
          if (obj.make_ids) {
            id = obj.id = verifier.id;
            short_id = obj.short_id = verifier.short_id;
          }
          out = typeof err !== "undefined" && err !== null ? {} : {
            json_obj: json_obj,
            json_str: json_str,
            id: id,
            short_id: short_id
          };
          return cb(err, out);
        };
      })(this));
    };

    Base.prototype.km = function() {
      return this.sig_eng.get_km();
    };

    return Base;

  })();

  exports.Base = Base;

  exports.sig_id_to_short_id = sig_id_to_short_id;

  exports.make_ids = make_ids;

  exports.add_ids = add_ids;

}).call(this);
