// index.js

var loadFile = function (event) {
  var output = document.getElementById("output");
  output.src = URL.createObjectURL(event.target.files[0]);
  output.onload = function () {
    URL.revokeObjectURL(output.src); // free memory
  };

  // Set the value of the hidden input field with the filename
  document.getElementById("imageFilename").value = event.target.files[0].name;
};

// Add an event listener to the form submission
document.querySelector(".form").addEventListener("submit", function (event) {
  event.preventDefault(); // Prevent the default form submission behavior

  // Send an additional request to the server to get the image URL
  fetch("/getUploadedImageUrl", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      filename: document.getElementById("imageFilename").value,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);

      // Now you can use data.imageUrl as needed in your client-side code
    })
    .catch((error) => console.error(error));

  // Continue with your form submission logic if needed
  this.submit();
});
