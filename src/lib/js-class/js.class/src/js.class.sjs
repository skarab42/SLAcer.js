macro class {
  rule {
    $className {
        $($mname $mparams $mbody)...
    }

  } => {
    var $className = JSClass({
        $($mname: function $mname $mparams $mbody,)...
    });
  }

  rule {
    $className extends $parentClassName {
        $($mname $mparams $mbody) ...
    }
  } => {
    var $className = $parentClassName.extend({
        $($mname: function $mname $mparams {clsSuper $className $mname $mbody},)...
    });
  }

  rule {
    $className implements $mixins... {
        $($mname $mparams $mbody) ...
    }

  } => {
    var $className = JSClass({
        $($mname: function $mname $mparams $mbody,)...
    }).mixin($mixins...);
  }

  rule {
    $className extends $parentClassName implements $mixins... {
        $($mname $mparams $mbody) ...
    }
  } => {
    var $className = $parentClassName.extend({
        $($mname: function $mname $mparams $mbody,)...
    }).mixin($mixins...);
  }

}

macro clsSuper {
    case { $ctx $cls $method { $body ... } } => {
        var stx = #{ $body ... };
        if (stx.length === 0) {
          return #{};
        }
        var res = search(stx);
        var ctx = stx[0];
        res = [
            //preserve this
            makeKeyword('var', ctx), 
            makeIdent('__self__', ctx),
            makePunc('=', ctx), 
            makeIdent('this', ctx), 
            makePunc(';', ctx)

            
        ].concat(res);
        
        return res;

        function search(stx) {
            var res = [];
            for(var i=0; i<stx.length; i++) {
                var s = stx[i];
                if(s.token.type == parser.Token.Delimiter) {
                    s.token.inner = search(s.token.inner);
                    res.push(s);
                } else if(s.token.value == 'super') {
                    var n = stx[++i];
                    if(n.token.type == parser.Token.Delimiter) {
                       if(n.token.value == '()') {
                            var args = n;
                            var pre = [makeIdent('__self__', stx[0])];
                            if(args.token.inner.length) {
                                pre.push(makePunc(',', stx[0]));
                            }
                            args.token.inner = pre.concat(args.token.inner);
                            var refstx = withSyntax($args = [args]) {
                                return #{ Object.getPrototypeOf($cls.prototype).$method.call $args }
                            }
                            res = res.concat(refstx);
                        }
                    }
                } else {
                    res.push(s);
                }
            }

            return res;
        }
    }
}
operator (is) 14 right { $var, $className } => #{ $var.typeOf($className) }
