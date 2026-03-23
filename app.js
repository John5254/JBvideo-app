// Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import { getDatabase, ref, push, onValue, remove }
from "https://www.gstatic.com/firebasejs/12.11.0/firebase-database.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBz88oVncv6fJupuk-X9-3ElQoecydoqcY",
  authDomain: "jbvideoapp.firebaseapp.com",
  databaseURL: "https://jbvideoapp-default-rtdb.firebaseio.com",
  projectId: "jbvideoapp",
  storageBucket: "jbvideoapp.firebasestorage.app",
  messagingSenderId: "148297257790",
  appId: "1:148297257790:web:9cd03967f80b778c84526f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// ✅ ADD VIDEO
window.addVideo = function() {
  const titleInput = document.getElementById("title");
  const thumbnailInput = document.getElementById("thumbnail");
  const videoURLInput = document.getElementById("videoURL");
  const button = document.getElementById("addBtn");
  
  const title = titleInput.value.trim();
  const thumbnail = thumbnailInput.value.trim();
  const videoURL = videoURLInput.value.trim();
  
  if (!title || !thumbnail || !videoURL) {
    showToast("Fill all fields");
    return;
  }
  
  if (!videoURL.startsWith("http")) {
    showToast("Enter a valid video URL");
    return;
  }
  
  // Disable button
  button.disabled = true;
  button.innerText = "Adding...";
  
  push(ref(db, "videos"), {
      title,
      thumbnail,
      videoURL,
      createdAt: Date.now()
    })
    .then(() => {
      // Clear inputs
      titleInput.value = "";
      thumbnailInput.value = "";
      videoURLInput.value = "";
      
      titleInput.focus();
      
      showToast("Video added successfully!");
    })
    .catch(() => {
      showToast("Error adding video");
    })
    .finally(() => {
      button.disabled = false;
      button.innerText = "Add Video";
    });
};

// ✅ LOAD + DELETE VIDEOS
onValue(ref(db, "videos"), (snapshot) => {
  const grid = document.getElementById("videoGrid");
  if (!grid) return;
  
  grid.innerHTML = "Loading videos...";
  
  if (!snapshot.exists()) {
    grid.innerHTML = "No videos yet";
    return;
  }
  
  grid.innerHTML = "";
  
  snapshot.forEach((child) => {
    const data = child.val();
    const key = child.key;
    
    const div = document.createElement("div");
    div.className = "card";
    
    div.innerHTML = `
      <img src="${data.thumbnail}">
      <p>${data.title}</p>
      <button class="delete-btn">Delete</button>
    `;
    
    // Open video
    div.onclick = () => {
      window.location.href = `video.html?url=${encodeURIComponent(data.videoURL)}`;
    };
    
    // Delete button
    const deleteBtn = div.querySelector(".delete-btn");
    
    deleteBtn.onclick = (e) => {
      e.stopPropagation();
      
      const confirmDelete = confirm("Delete this video?");
      if (!confirmDelete) return;
      
      remove(ref(db, "videos/" + key))
        .then(() => showToast("Video deleted"))
        .catch(() => showToast("Error deleting video"));
    };
    
    grid.appendChild(div);
  });
});

// ✅ TOAST FUNCTION
function showToast(message) {
  const toast = document.createElement("div");
  toast.innerText = message;
  toast.className = "toast";
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.remove();
  }, 3000);
          }
