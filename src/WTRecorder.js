export class WTRecorder {
  /**
   * Creates a WTRecorder instance for streaming media via WebTransport.
   * @param {string} serverUrl - The WebTransport server URL.
   * @param {MediaStream} stream - The media stream to record.
   * @param {Object} [wtOptions={}] - Optional WebTransport configuration.
   * @param {string} [mimeType="video/webm"] - The MIME type for MediaRecorder.
   */
  constructor(serverUrl, stream, wtOptions = {}, mimeType = "video/webm") {
    this.serverUrl = serverUrl;
    this.stream = stream;
    this.chunks = [];

    // Initialize WebTransport with optional WebTransport options
    this.transport = new WebTransport(this.serverUrl, wtOptions);

    // Initialize MediaRecorder
    this.mediaRecorder = new MediaRecorder(stream, { mimeType });

    this.mediaRecorder.ondataavailable = async (event) => {
      if (event.data.size > 0) {
        this.chunks.push(event.data);
        if (this.writeStream) {
          const bytes = await event.data.bytes();
          this.writeStream.write(bytes);
        }
      }
    };

    this.mediaRecorder.onerror = (event) => {
      console.error("MediaRecorder Error:", event);
    };

    this.mediaRecorder.onstop = () => {
      console.log("MediaRecorder stopped.");
      this.cleanup();
    };
  }

  /**
   * Starts recording and initializes WebTransport.
   * @param {number} [timeslice=1000] - The time interval in milliseconds for collecting data chunks.
   * @returns {Promise<void>}
   */
  async start(timeslice = 1000) {
    try {
      console.log("Connecting to WebTransport server...");
      await this.transport.ready;

      console.log("Connected! Opening stream...");
      const stream = this.transport.createUnidirectionalStream();
      this.writeStream = stream.getWriter();

      console.log(`Starting media recording with timeslice: ${timeslice}ms`);
      this.mediaRecorder.start(timeslice); // Default to 1000ms chunks
    } catch (error) {
      console.error("Failed to start WebTransport session:", error);
    }
  }

  /**
   * Stops the recording and closes the WebTransport connection.
   * @returns {Promise<void>}
   */
  async stop() {
    console.log("Stopping media recorder...");
    this.mediaRecorder.stop();

    if (this.writeStream) {
      await this.writeStream.close();
    }

    if (this.transport) {
      console.log("Closing WebTransport connection...");
      await this.transport.close();
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
    return new Blob(this.chunks, { type: this.mediaRecorder.mimeType });
  }
}
