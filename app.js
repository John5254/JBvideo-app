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

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);


// 🔥 AUTO YOUTUBE THUMBNAIL
window.autoThumbnail = function() {
  const videoURL = document.getElementById("videoURL").value;
  const thumbnailInput = document.getElementById("thumbnail");
  
  if (videoURL.includes("youtube.com") || videoURL.includes("youtu.be")) {
    let videoId = "";
    
    if (videoURL.includes("watch?v=")) {
      videoId = videoURL.split("watch?v=")[1].split("&")[0];
    } else if (videoURL.includes("youtu.be/")) {
      videoId = videoURL.split("youtu.be/")[1];
    }
    
    if (videoId) {
      thumbnailInput.value = `https://img.youtube.com/vi/${videoId}/0.jpg`;
    }
  }
};


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
  
  button.disabled = true;
  button.innerText = "Adding...";
  
  push(ref(db, "videos"), {
      title,
      thumbnail,
      videoURL,
      createdAt: Date.now()
    })
    .then(() => {
      titleInput.value = "";
      thumbnailInput.value = "";
      videoURLInput.value = "";
      titleInput.focus();
      
      showToast("Video added!");
    })
    .catch(() => {
      showToast("Error adding video");
    })
    .finally(() => {
      button.disabled = false;
      button.innerText = "Add Video";
    });
};


// ✅ LOAD + DELETE
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
    
    div.onclick = () => {
      window.location.href = `video.html?url=${encodeURIComponent(data.videoURL)}`;
    };
    
    const deleteBtn = div.querySelector(".delete-btn");
    
    deleteBtn.onclick = (e) => {
      e.stopPropagation();
      
      const confirmDelete = confirm("Delete this video?");
      if (!confirmDelete) return;
      
      remove(ref(db, "videos/" + key))
        .then(() => showToast("Deleted"))
        .catch(() => showToast("Error"));
    };
    
    grid.appendChild(div);
  });
});


// ✅ TOAST
function showToast(message) {
  const toast = document.createElement("div");
  toast.innerText = message;
  toast.className = "toast";
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.remove();
  }, 3000);
}
