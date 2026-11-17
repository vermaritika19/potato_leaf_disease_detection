
import { useState } from "react";

function App() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (event) => {
    const selectedImage = event.target.files[0];

    if (selectedImage) {
      if (!selectedImage.type.startsWith("image/")) {
        alert("Please select a valid image.");
        return;
      }

      setImage(selectedImage);
      setPreview(URL.createObjectURL(selectedImage));
      setResult(null);
    }
  };

  const handlePredict = async () => {
    if (!image) {
      alert("Please upload an image first.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();

      formData.append("image", image);

      const response = await fetch(
        "http://127.0.0.1:5000/predict",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Prediction failed");
      }

      setResult(data);

    } catch (error) {
      alert(error.message);

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-10">

      <div className="mx-auto max-w-2xl rounded-lg bg-white p-6 shadow-md">

        <h1 className="mb-2 text-center text-2xl font-bold text-green-700">
          Potato Leaf Disease Detection
        </h1>

        <p className="mb-6 text-center text-gray-600">
          Upload a potato leaf image to detect its disease.
        </p>

        <div className="rounded-lg border-2 border-dashed border-gray-300 p-6 text-center">

          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="mb-4 w-full"
          />

          {preview && (
            <img
              src={preview}
              alt="Potato Leaf Preview"
              className="mx-auto mb-4 h-56 rounded-lg object-contain"
            />
          )}

          <button
            onClick={handlePredict}
            disabled={!image || loading}
            className="rounded-md bg-green-600 px-6 py-2 text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {loading ? "Predicting..." : "Predict Disease"}
          </button>

        </div>

        {result && (
          <div className="mt-6 rounded-lg bg-green-50 p-4">

            <h2 className="mb-3 text-xl font-semibold text-green-700">
              Prediction Result
            </h2>

            <p className="mb-2 text-gray-700">
              Disease: {result.prediction}
            </p>

            <p className="text-gray-700">
              Confidence: {Number(result.confidence).toFixed(2)}%
            </p>

          </div>
        )}

      </div>
    </div>
  );
}
export default App;