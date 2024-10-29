module.exports = {
    apps : [{
      name: "api_analitic",
      script: "dist/main.js",
      instances: 1,
      log_date_format: "YYYY-MM-DD HH:mm Z", 
      output: "./logs/output.log",
      error: "./logs/error.log",

    }
    ]
  }