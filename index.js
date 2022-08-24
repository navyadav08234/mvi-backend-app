const express = require('express');
const cors = require('cors');
const request = require('request');
const multer = require('multer');
const upload = multer();
const fileFolder = './files/';
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.send('Hi There')
  });


// Set the Server Port
var PORT  = process.env.PORT || 8080

// get the response for the data. 
app.post("/processFile",upload.single('files'), (req, res) => {
    //console.log(req.file);
    let options = {
    'method': 'POST',
    'url': 'https://demo.visualinspection.maximo35.innovationcloud.info/api/dlapis/04bd06f9-95cf-46d6-a0d8-e0bedf1fc1f5',
    'headers': {
        'apikey': 'dyCU-j8s7-iWm2-rW8H'
    },
    formData: {
        'files': {
        'value': req.file.buffer,
        'options': {
            'filename': req.file.originalname,
            'contentType': null
        }
        }
    }
    };
    request(options, function (error, response) {
    if (error) throw new Error(error);
    //console.log(response.body);
    let processingPayload = JSON.parse(response.body);

    // Submit the results to Monitor.
    let options1 = {
        'method': 'POST',
        'url': 'https://demo.messaging.iot.maximo35.innovationcloud.info/api/v0002/device/types/MVI_DEVICES/devices/MVI_DEVICE/events/mvi_data',
        'headers': {
        'clientid': '',
        'Authorization': 'Basic dXNlLXRva2VuLWF1dGg6VTFuUV9NVyhMLXNOUF9uZWM3',
        'Content-Type': 'application/json'
        },
        body: JSON.stringify({
        "name": processingPayload.classified[0].name,
        "confidence": processingPayload.classified[0].confidence,
        "datasetId": processingPayload.saveInferenceResults.datasetId,
        "fileId": processingPayload.saveInferenceResults.fileId
        })
    
    };
        request(options1, function (error1, response1) {
        if (error1) throw new Error(error1);
        //console.log(response1);
        });
    res.send(response.body);
    });

  })

// get the all the files in the filesystem. 
app.get("/getFileNames", (req, res) => {
    let fileNames = []
    let response = {}
    fs.readdir(fileFolder, (err, files) => {
        files.forEach(file => {
            fileNames.push(file);
        });
        //console.log(fileNames);
        response = {
            "filenames":fileNames
        }
        res.send({"filenames":fileNames})
      });
    
  })

// get the file from the system and return the processing results from MVI. 
app.get("/getFile", (req, res) => {
    const filename = req.query.filename;
    let filepath = fileFolder + filename;
    let processingPayload = ""
    fs.readFile(filepath, (err, data) => {
        if (err) {
            return console.log(err);
          }
        
        let options = {
            'method': 'POST',
            'url': 'https://demo.visualinspection.maximo35.innovationcloud.info/api/dlapis/04bd06f9-95cf-46d6-a0d8-e0bedf1fc1f5',
            'headers': {
                'apikey': 'dyCU-j8s7-iWm2-rW8H'
            },
            formData: {
                'files': {
                'value': data,
                'options': {
                    'filename': filename,
                    'contentType': null
                }
                }
            }
            };
            request(options, function (error, response) {
            if (error) throw new Error(error);
            //console.log("response body " + response.body);
            processingPayload = JSON.parse(response.body);
            processingPayload['fileName'] = filename;
            // Submit the results to Monitor.
            let options1 = {
                'method': 'POST',
                'url': 'https://demo.messaging.iot.maximo35.innovationcloud.info/api/v0002/device/types/MVI_DEVICES/devices/MVI_DEVICE/events/mvi_data',
                'headers': {
                'clientid': '',
                'Authorization': 'Basic dXNlLXRva2VuLWF1dGg6VTFuUV9NVyhMLXNOUF9uZWM3',
                'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                "name": processingPayload.classified[0].name,
                "confidence": processingPayload.classified[0].confidence,
                "datasetId": processingPayload.saveInferenceResults.datasetId,
                "fileId": processingPayload.saveInferenceResults.fileId
                })
            
            };
                request(options1, function (error1, response1) {
                if (error1) throw new Error(error1);
                //console.log(response1);
                });
                
            res.send(processingPayload);
            });
      });

    
  })

  app.listen(PORT, () => { })

module.exports = app;