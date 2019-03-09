const Express = require("express");
const App = Express();
const Mercury = require("@postlight/mercury-parser");
const Validator = require("./validator");

function decodeURL(encodedURL) {
    if (!encodedURL) {
        throw new Error("base64_url parameter required");
    }
    return Buffer.from(encodedURL, "base64").toString("utf-8");
}

function getParams(request) {
    const user = request.params.user;
    const signature = request.params.signature;
    const base64url = request.query.base64_url.replace(/ /g, '+');
    const url = decodeURL(base64url)
    return {user, signature, url}
}

App.get("/health_check", (request, response) => {
    response.send("200 OK");
});

App.get("/parser/:user/:signature", (request, response, next) => {
    const {user, signature, url} = getParams(request);
    new Validator(user, url, signature).validate().then(result => {
        Mercury.parse(url).then(result => {
            response.status(("error" in result ? 500 : 200))
            response.send(result);
        }).catch(next);
    }).catch(next);
});

const server = App.listen((process.env.PORT || 3000));

process.on("SIGINT", () => {
    if (process.env.NODE_ENV === "production") {
        server.close(function(error) {
            console.error("SIGINT received, shutting down");
            if (error) {
                console.error(err);
                process.exit(1);
            }
        })
    } else {
        process.exit(0);
    }
})