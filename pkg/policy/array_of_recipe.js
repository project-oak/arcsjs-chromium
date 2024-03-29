export const ArrayOfRecipe = [{
  "CameraNode1:camera": {
    "$slots": {},
    "$kind": "$library/NewMedia/Camera",
    "$inputs": [
      {
        "stream": "CameraNode1:stream"
      }
    ],
    "$outputs": [
      {
        "stream": "CameraNode1:stream"
      },
      {
        "frame": "CameraNode1:frame"
      }
    ],
    "$container": "main#runner"
  },
  "CameraNode1:deviceUx": {
    "$slots": {},
    "$kind": "Media/DeviceUx",
    "$inputs": [
      {
        "mediaDevices": "CameraNode1:mediaDevices"
      },
      {
        "mediaDeviceState": "CameraNode1:mediaDeviceState"
      }
    ],
    "$outputs": [
      {
        "mediaDeviceState": "CameraNode1:mediaDeviceState"
      }
    ],
    "$container": "CameraNode1:camera#device"
  },
  "CameraNode1:defaultStream": {
    "$slots": {},
    "$kind": "Media/MediaStream",
    "$inputs": [
      {
        "mediaDeviceState": "CameraNode1:mediaDeviceState"
      }
    ],
    "$outputs": [
      {
        "mediaDevices": "CameraNode1:mediaDevices"
      }
    ],
    "$container": "CameraNode1:camera#device"
  },
  "CameraNode1:imageCapture": {
    "$slots": {},
    "$kind": "$library/NewMedia/ImageCapture",
    "$inputs": [
      {
        "stream": "CameraNode1:stream"
      },
      {
        "fps": "CameraNode1:fps"
      }
    ],
    "$outputs": [
      {
        "frame": "CameraNode1:frame"
      }
    ],
    "$container": "CameraNode1:camera#capture"
  },
  "$meta": {
    "name": "7242-6509-7133$$CameraNode1"
  },
  "$stores": {
    "CameraNode1:mediaDeviceState": {
      "$type": "MedaDeviceState",
      "$value": {
        "isCameraEnabled": false,
        "isMicEnabled": false,
        "isAudioEnabled": false
      }
    },
    "CameraNode1:mediaDevices": {
      "$type": "[JSON]"
    },
    "CameraNode1:stream": {
      "$type": "Stream",
      "$value": "default"
    },
    "CameraNode1:fps": {
      "$type": "Number",
      "$value": 30
    },
    "CameraNode1:frame": {
      "$type": "Image",
      $tags: ['private']
    }
  }
}, {
  "ImageNode1:image": {
    "$slots": {},
    "$kind": "$library/NewMedia/Image",
    "$inputs": [
      {
        "connectedImage": "CameraNode1:frame"
      },
      {
        "image": "ImageNode1:image"
      }
    ],
    "$outputs": [
      {
        "image": "ImageNode1:image"
      }
    ],
    "$container": "main#runner"
  },
  "$meta": {
    "name": "7242-6509-7133$$ImageNode1"
  },
  "$stores": {
    "ImageNode1:image": {
      "$type": "Image",
      "$value": {
        "url": "https://storage.googleapis.com/tfweb/testpics/strawberry2.jpeg",
      },
      $tags: ['public']
    }
  }
}]