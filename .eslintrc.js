module.exports = {
    "env": {
        "es6": true,
        "node": true
    },
    "extends": "eslint:recommended",
    "globals": {
        "describe": true,
        "it": true,
        "before": true
    },
    "rules": {
        "eqeqeq": "error",
        "curly": "error",
        "complexity": [ "error", 10 ],
        "brace-style": [ "error", "1tbs" ],
        "indent": [ "error", 4 ],
        "no-param-reassign": [ "error", { props: false } ],
        "semi": [ "error", "always" ]
    }
};
