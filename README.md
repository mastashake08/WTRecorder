### **README.md**

# WTRecorder

WTRecorder is a lightweight JavaScript library that uses **WebTransport** and **MediaRecorder APIs** to record and stream media data in real-time. Ideal for low-latency media streaming applications.

## 🚀 Features
- 🎥 **Records media** from `MediaStream` (video/audio)
- 📡 **Streams data via WebTransport** for low-latency transmission
- ⚡ **Asynchronous API** for smooth handling
- 🔧 **Customizable settings** via WebTransport options
- 📄 **Exports recorded media as a Blob**

---

## 📦 Installation

```
npm install wt-recorder
```

---

## 🚀 Usage

### **Importing the Module**
Ensure that your project supports **ES Modules**:
- Use `"type": "module"` in `package.json`
- OR rename your file to `.mjs`

```js
import { WTRecorder } from 'wt-recorder';
```

### **Getting Media Stream**
```js
const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
```

### **Creating and Starting the Recorder**
```js
const wtOptions = { allowPooling: true }; // Optional WebTransport options
const serverUrl = "https://your-server.com/webtransport";

const recorder = new WTRecorder(serverUrl, stream, wtOptions);
await recorder.start(500); // Start recording with 500ms timeslice
```

### **Stopping and Retrieving Recorded Data**
```js
setTimeout(async () => {
  await recorder.stop();
  const recordedBlob = recorder.getRecordedBlob();
  console.log("Recorded Blob:", recordedBlob);
}, 5000); // Stop recording after 5 seconds
```

---

## 📖 API Reference

### **WTRecorder Constructor**
```js
const recorder = new WTRecorder(serverUrl, stream, wtOptions, mimeType);
```
#### **Parameters:**
- `serverUrl` (**string**) – WebTransport server URL.
- `stream` (**MediaStream**) – Video/audio stream to be recorded.
- `wtOptions` (**Object** | optional) – WebTransport configuration settings (default: `{}`).
- `mimeType` (**string** | optional) – MIME type for recording (default: `"video/webm"`).

---

### **Methods**

#### **`.start(timeslice = 1000)`**
Starts the recording and WebTransport streaming.

| Parameter  | Type   | Default | Description |
|------------|--------|---------|-------------|
| `timeslice` | `number` | `1000` | Time interval (ms) for collecting chunks |

#### **`.stop()`**
Stops the recording and closes the WebTransport session.

#### **`.getRecordedBlob()`**
Returns the recorded media as a **Blob**.

#### **`.cleanup()`**
Cleans up resources after stopping the recording.

---

## ⚡ Example App
```js
import { WTRecorder } from 'wt-recorder';

(async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

  const recorder = new WTRecorder("https://your-server.com/webtransport", stream, { allowPooling: true });

  await recorder.start(500);

  setTimeout(async () => {
    await recorder.stop();
    const recordedBlob = recorder.getRecordedBlob();
    console.log("Recorded Blob:", recordedBlob);
  }, 5000);
})();
```

---

## 📜 License
This project is licensed under the **MIT License**.

---

## ✨ Contributors
Contributions are welcome! Feel free to submit PRs or open issues.

```

---

### **Key Updates in This README**
✅ **ES Module support** (`import { WTRecorder } from 'wt-recorder';`)  
✅ **Clear API documentation with parameters & defaults**  
✅ **Full example app for easy usage**  
✅ **Install instructions & WebTransport details**  
