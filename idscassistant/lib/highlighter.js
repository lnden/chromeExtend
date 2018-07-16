! function (a, b) {
    if ("object" == typeof module && "object" == typeof module.exports) {
        var c = require("jQuery");
        module.exports = b(c)
    } else "function" == typeof define && define.amd ? define(["jQuery"], function (a) {
        return b(a)
    }) : a.highlighter = a.highlighter || b(a.jQuery)
}(this, function (a) {
    function b() {
        for (var a in m) clearTimeout(m[a])
    }
    var highlightDocument, d, e, f, g, h = this,
        i = "_mh_cid",
        j = "IDSC-Assistant",
        k = "IDSC-Assistant-style-1",
        l = {};
    highlightDocument = function (a, b, c) {
        if (a && !l.isScriptOrStyle(a) && !l.isContentEditable(a)) {
            c && e(a, b);
            for (var d = document.createNodeIterator(a, NodeFilter.SHOW_TEXT, function (b) {
                return l.isUnderContentEditableOrStyleScript(b, a) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT
            }, !1), g = d.nextNode(); g;) highlightEachWord(g, b), g = d.nextNode()
        }
    };
    d = function (a) {
        if (a.previousSibling && a.previousSibling.nodeType == 3 && a.nextSibling && a.nextSibling.nodeType == 3) {
			(a.previousSibling.nodeValue = a.previousSibling.nodeValue + a.innerText + a.nextSibling.nodeValue, a.nextSibling.remove()) 
		} else {
		     if (a.previousSibling && a.previousSibling.nodeType == 3){
			    a.previousSibling.nodeValue = a.previousSibling.nodeValue + a.innerText 
			 } else {
				if (a.nextSibling && a.nextSibling.nodeType == 3) {
					a.nextSibling.nodeValue = a.innerText + a.nextSibling.nodeValue
				} else {
					if (a.parentNode) {
                        a.parentNode.insertBefore(document.createTextNode(a.innerText), a)
                    }
				}				 
			 }
		}
		a.remove()
		  
		  

    };
    e = function (b, c) {
        a(b).find("." + j).each(function () {
            -1 == c.indexOf(this.innerText) && d(this)
        })
    };
    highlightEachWord = function (a, keywords) {
        var c, d, e, f = a.parentNode;
        if (!f || "string" != typeof f.className || -1 == f.className.indexOf(j))
            for (var h = keywords.length - 1; h >= 0; h--) {
                if (keywords[h].deleteFlag == 1) {
                    continue;
                }
                c = keywords[h].keyword;
                if (c.length >= 1) {
                    if (/.*[A-z_-]+.*$/.test(c)) {
                        d = a.nodeValue.toLowerCase().indexOf(c.toLowerCase());
                    } else {
                        d = a.nodeValue.indexOf(c);
                    }
                    e = d + c.length;
                    -1 == d || addClassToNode(keywords, a, f, d, e, h)
                }
            }
    };
    addClassToNode = function (keywords, b, c, d, e, index) {
        var h = b.nodeValue,
            i = 0 != d ? document.createTextNode(h.slice(0, d)) : null,
            l = document.createElement("i");
        l.className = j + function() {
            if (e - d == 1) {
                return " " + k;
            }
            return "";
        } ();
        l.style.color = keywords[index].fontColor;
        l.style.backgroundColor = keywords[index].color;
        l.innerHTML = h.slice(d, e);
        b.nodeValue = h.slice(e);
        c.insertBefore(l, b);
        null != i && (c.insertBefore(i, l), highlightEachWord(i, keywords));
        highlightEachWord(b, keywords);
    };
    l.isContentEditable = function (a) {
        return a && (a.parentNode && a.parentNode.isContentEditable || a.isContentEditable)
    };
    l.isUnderContentEditableOrStyleScript = function (a, b) {
        for (; a && a != b;) {
            if (a.tagName && (a.isContentEditable || -1 != ["style", "script"].indexOf(a.tagName.toLowerCase()))) return !0;
            a = a.parentNode
        }
        return !1
    };
    l.isScriptOrStyle = function (a) {
        return a.tagName && (-1 != ["style", "script"].indexOf(a.tagName.toLowerCase()) || a.parentNode && -1 != ["style", "script"].indexOf(a.parentNode.tagName.toLowerCase()))
    };
    l.isChildNode = function (a, b) {
        return -1 != Array.prototype.indexOf.call(b.childNodes, a)
    };
    l.isWrapNode = function (a) {
        return a == document || document.body && a == document.body
    };
    l.cid = function (a) {
        return function () {
            return ++a
        }
    }(0);
    var m = {},
        n = {
            highlight: function (a, keywords, e) {
                var f = a[i];
                f || (a[i] = f = l.cid()), l.isWrapNode(a) && b(), clearTimeout(m[f]), m[f] = setTimeout(function () {
                    highlightDocument.call(h, a, keywords, e)
                }, 200)
            },
            clearHighlighted: function (c) {
                b(), a(c).find("." + j).each(function () {
                    d(this)
                })
            }
        };
    return n
});