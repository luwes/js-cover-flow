// API serves JSONP (with a callback) so all we have to do
// is create a script element with the right 'src':

function JSONPUtil(url, callback) {
    this.url = url;
    this.callback = callback || function(){};
    this.fetch = function() {
 
        if (!this.url || !this.callback) {
            throw new Error('JSONPUtil.fetch(): Parameters may be undefined');
        }
 
        var scriptEl = document.createElement('script'),
            uid = 'jsonp_' + +new Date(),
            encodedQuery = encodeURI(this.url),
            instance = this;
 
        JSONPUtil[uid] = function(json) {
            instance.callback(json);
            delete JSONPUtil[uid];
            document.body.removeChild(scriptEl);
        };
 
        // TBD: Below code assumes that the passed URL has atleast one parameter specified. It appends the callback parameter
        // using & instead of ? if callback is the first parameter.
        scriptEl.src = encodedQuery + '&callback=JSONPUtil.' + uid; 
        document.body.appendChild(scriptEl);
 
    };
}
