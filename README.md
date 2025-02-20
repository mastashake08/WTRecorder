

# WTRecorder

**WTRecorder** is a JavaScript library that enables media recording and low-latency transmission using the **WebTransport** and **MediaRecorder** APIs. It is designed for real-time media streaming applications requiring efficient media capture and transmission.

---

## Installation

To install the package, use npm:

```sh
npm install @mastashake08/wt-recorder
```

---

## Importing the Library

Ensure that your project supports **ES Modules** by:
- Adding `"type": "module"` in `package.json`
- OR renaming your file to `.mjs`

```js
import { WTRecorder } from '@mastashake08/wt-recorder';
```

---

## Usage

### **Obtaining a Media Stream**
To capture video and audio from the user's device:

```js
const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
```

### **Creating an Instance and Starting the Recorder**
```js
const serverUrl = "https://your-server.com/webtransport";
const wtOptions = { allowPooling: true }; // Optional WebTransport configuration

const recorder = new WTRecorder(serverUrl, stream, wtOptions);
await recorder.start(500); // Start recording with a 500ms timeslice
```

### **Stopping the Recorder and Retrieving the Recorded Data**
```js
setTimeout(async () => {
  await recorder.stop();
  const recordedBlob = recorder.getRecordedBlob();
  console.log("Recorded Blob:", recordedBlob);
}, 5000); // Stop recording after 5 seconds
```

---

## API Reference

### **WTRecorder Constructor**
```js
const recorder = new WTRecorder(serverUrl, stream, wtOptions, mimeType);
```

#### **Parameters**
- `serverUrl` (**string**) – WebTransport server URL.
- `stream` (**MediaStream**) – Video/audio stream to be recorded.
- `wtOptions` (**Object**, optional) – WebTransport configuration settings (default: `{}`).
- `mimeType` (**string**, optional) – MIME type for recording (default: `"video/webm"`).

---

### **Methods**

#### **start(timeslice = 1000)**
Initializes WebTransport and starts recording.

| Parameter  | Type   | Default | Description |
|------------|--------|---------|-------------|
| `timeslice` | `number` | `1000` | Time interval (ms) for collecting data chunks |

**Returns:** `Promise<void>`

---

#### **stop()**
Stops recording and closes the WebTransport session.

**Returns:** `Promise<void>`

---

#### **getRecordedBlob()**
Returns the recorded media as a `Blob`.

**Returns:** `Blob`

Throws an error if no recorded data is available.

---

#### **cleanup()**
Cleans up resources and resets the instance.

---

#### **convertBase64Digest(base64Digest)**
Converts a Base64-encoded server digest into a format compatible with WebTransport.

**Parameters:**
- `base64Digest` (**string**) – Base64-encoded SHA-256 digest.

**Returns:** `Uint8Array`

Throws an error if the input is not a valid Base64 string.

```js
const digest = "c29tZUJhc2U2NERpZ2VzdA=="; // Example Base64 digest
const uint8Array = WTRecorder.convertBase64Digest(digest);
console.log(uint8Array);
```

---

## Example Implementation

```js
import { WTRecorder } from '@mastashake08/wt-recorder';

(async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

    const wtOptions = { allowPooling: true };
    const recorder = new WTRecorder("https://your-server.com/webtransport", stream, wtOptions);

    await recorder.start(500);

    setTimeout(async () => {
      await recorder.stop();
      const recordedBlob = recorder.getRecordedBlob();
      console.log("Recorded Blob:", recordedBlob);
    }, 5000);
  } catch (error) {
    console.error("WTRecorder Error:", error);
  }
})();
```

---

## Error Handling

WTRecorder includes robust error handling:
- Validates input parameters (server URL, media stream).
- Logs WebTransport initialization failures.
- Handles errors from `MediaRecorder` and stops the recording if necessary.
- Ensures cleanup after failures.
- Throws explicit errors for invalid input formats.

---

## License

This project is licensed under the **MIT License**.

---

## Contributions

Contributions are welcome. Submit issues or pull requests for improvements and feature requests.

---
