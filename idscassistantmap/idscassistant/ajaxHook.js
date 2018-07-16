function captureXMLHttpRequest(recorder) {
    var XHR = XMLHttpRequest.prototype;

    var open = XHR.open;
    var send = XHR.send;
    var setRequestHeader = XHR.setRequestHeader;

    // Collect data:
    XHR.open = function (method, url) {
        this._method = method;
        this._url = url;
        this._requestHeaders = {};
        this._startTime = (new Date()).toISOString();
        return open.apply(this, arguments);
    };

    XHR.setRequestHeader = function (header, value) {
        this._requestHeaders[header] = value;
        return setRequestHeader.apply(this, arguments);
    };

    XHR.send = function (postData) {
        this.addEventListener('load', function () {
            var endTime = (new Date()).toISOString();

            if (recorder) {
                var myUrl = this._url ? this._url.toLowerCase() : this._url;
                if (myUrl) {

                    var requestModel = {
                        'uri': this._url,
                        'verb': this._method,
                        'time': this._startTime,
                        'headers': this._requestHeaders
                    };

                    if (postData) {
                        if (typeof postData === 'string') {
                            try {
                                requestModel['body'] = (postData);
                            } catch (err) {
                                console.log('JSON decode failed');
                                console.log(err);
                                requestModel['transfer_encoding'] = 'base64';
                                requestModel['body'] = postData;
                            }
                        } else if (typeof postData === 'object' || typeof postData === 'array' || typeof postData === 'number' || typeof postData === 'boolean') {
                            requestModel['body'] = postData;
                        }
                    }

                    var responseHeaders = this.getAllResponseHeaders();

                    var responseModel = {
                        'status': this.status,
                        'time': endTime,
                        'headers': responseHeaders
                    };

                    console.log("AjaxHook:", this);
                    if ((this.responseType == "" || this.responseType == "text" )&& this.responseText) {
                        // console.log("AjaxHook: saving the responseText", this.responseText);
                        try {
                            responseModel['body'] = _.JSONDecode(this.responseText);
                        } catch (err) {
                            responseModel['transfer_encoding'] = 'base64';
                            responseModel['body'] = this.responseText;
                        }
                    } else if (this.response) {
                        // console.log("AjaxHook: saving the response, type=", this.responseType, this.response);
                        responseModel['body'] = this.response;
                    }

                    var event = {
                        'request': requestModel,
                        'response': responseModel
                    };
                    recorder(event);
                }
            }
        });
        return send.apply(this, arguments);
    };

    var undoPatch = function () {
        XHR.open = open;
        XHR.send = send;
        XHR.setRequestHeader = setRequestHeader;
    };

    return undoPatch;
    // so caller have a handle to undo the patch if needed.
}

console.log("ajaxHook is running");
captureXMLHttpRequest(function(event) {
    const domain = window.location.protocol + '//' + window.location.hostname + ':' + window.location.port;
    // console.log(domain);
    window.postMessage({ type: 'API_AJAX_CALL', payload: event}, domain);
});
