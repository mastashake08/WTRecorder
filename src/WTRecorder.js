export class WTRecorder {
  /**
   * Creates a WTRecorder instance for streaming media via WebTransport.
   * @param {string} serverUrl - The WebTransport server URL.
   * @param {MediaStream} stream - The media stream to record.
   * @param {Object} [wtOptions={}] - Optional WebTransport configuration.
   * @param {string} [mimeType="video/webm"] - The MIME type for MediaRecorder.
   */
  constructor(serverUrl, stream, wtOptions = {}, mimeType = "video/webm") {
    if (!serverUrl || typeof serverUrl !== "string") {
      throw new Error("Invalid serverUrl: Expected a non-empty string.");
    }
    if (!(stream instanceof MediaStream)) {
      throw new Error("Invalid stream: Expected a MediaStream instance.");
    }

    this.serverUrl = serverUrl;
    this.stream = stream;
    this.chunks = [];
    this.transport = null;
    this.writeStream = null;

    try {
      // Initialize WebTransport with optional WebTransport options
      this.transport = new WebTransport(this.serverUrl, wtOptions);
    } catch (error) {
      console.error("Failed to initialize WebTransport:", error);
      throw new Error("WebTransport initialization failed.");
    }

    try {
      // Initialize MediaRecorder
      this.mediaRecorder = new MediaRecorder(stream, { mimeType });

      this.mediaRecorder.ondataavailable = async (event) => {
        if (event.data.size > 0) {
          this.chunks.push(event.data);
          if (this.writeStream) {
            try {
              const arrBuff = await event.data.arrayBuffer();
              const bytes = new Uint8Array(arrBuff);
              await this.writeStream.write(bytes);
            } catch (err) {
              console.error("Failed to write to WebTransport stream:", err);
            }
          }
        }
      };

      this.mediaRecorder.onerror = (event) => {
        console.error("MediaRecorder encountered an error:", event.error);
        this.stop();
      };

      this.mediaRecorder.onstop = () => {
        console.log("MediaRecorder stopped.");
        this.cleanup();
      };
    } catch (error) {
      console.error("Failed to initialize MediaRecorder:", error);
      throw new Error("MediaRecorder initialization failed.");
    }
  }

  /**
   * Converts a Base64-encoded server digest to a format WebTransport accepts.
   * @param {string} base64Digest - Base64-encoded SHA-256 digest.
   * @returns {Uint8Array} - WebTransport-compatible format.
   * @throws {Error} - If input is not a valid Base64 string.
   */
  static convertBase64Digest(base64Digest) {
    if (typeof base64Digest !== "string") {
      throw new Error("Invalid input: Expected a Base64 string.");
    }

    try {
      const binaryString = atob(base64Digest);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes;
    } catch (error) {
      throw new Error("Failed to convert Base64 digest: Invalid Base64 format.");
    }
  }

  /**
   * Starts recording and initializes WebTransport.
   * @param {number} [timeslice=1000] - The time interval in milliseconds for collecting data chunks.
   * @returns {Promise<void>}
   */
  async start(timeslice = 1000) {
    if (!this.transport) {
      throw new Error("WebTransport instance is not available.");
    }

    try {
      console.log("Connecting to WebTransport server...");
      await this.transport.ready;

      console.log("Connected! Opening stream...");
      const stream = await this.transport.createUnidirectionalStream();
     
      this.writeStream = stream.getWriter();

      console.log(`Starting media recording with timeslice: ${timeslice}ms`);
      this.mediaRecorder.start(timeslice);
    } catch (error) {
      console.error("Failed to start WebTransport session or MediaRecorder:", error);
      this.cleanup();
      throw new Error("Recording start failed.");
    }
  }

  /**
   * Stops the recording and closes the WebTransport connection.
   * @returns {Promise<void>}
   */
  async stop() {
    if (!this.mediaRecorder || this.mediaRecorder.state === "inactive") {
      console.warn("MediaRecorder is not active.");
      return;
    }

    try {
      console.log("Stopping media recorder...");
      this.mediaRecorder.stop();

      if (this.writeStream) {
        await this.writeStream.close();
      }

      if (this.transport) {
        console.log("Closing WebTransport connection...");
        await this.transport.close();
      }
    } catch (error) {
      console.error("Error occurred while stopping WTRecorder:", error);
    } finally {
      this.cleanup();
    }
  }

  /**
   * Cleans up resources and resets the instance.
   */
  cleanup() {
    this.writeStream = undefined;
    this.transport = null;
    console.log("Cleanup complete.");
  }

  /**
   * Returns the recorded media as a Blob.
   * @returns {Blob} - The recorded media blob.
   */
  getRecordedBlob() {
    if (!this.chunks.length) {
      throw new Error("No recorded data available.");
    }
    return new Blob(this.chunks, { type: this.mediaRecorder.mimeType });
  }
}
