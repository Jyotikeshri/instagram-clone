// client.js

const setupLikesInteraction = () => {};

const sendLikesDataToServer = async (data) => {
  try {
    await fetch("/likes-endpoint", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  } catch (error) {
    console.error("Error sending likes data to the server:", error);
  }
};
