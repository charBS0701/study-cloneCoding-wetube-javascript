const videoContainer = document.getElementById("videoContainer");
const form = document.getElementById("commentForm");
const deleteCommentsBtn = document.querySelectorAll(".commentDeleteBtn");
const videoComments = document.querySelector(".video__comments ul");

const addComment = (text, id) => {
  const newComment = document.createElement("li");
  newComment.dataset.id = id;
  newComment.className = "video__comment";
  const icon = document.createElement("i");
  icon.className = "fas fa-comment";
  const span = document.createElement("span");
  span.innerText = ` ${text}`;
  const span2 = document.createElement("span");
  span2.className = "commentDeleteBtn";
  span2.innerText = "❌";
  // span2 id, class, dataset 등 추가
  newComment.appendChild(icon);
  newComment.appendChild(span);
  newComment.appendChild(span2);
  videoComments.prepend(newComment);

  // newComment 댓글삭제
  const newCommentDeleteBtn = document.querySelector(".commentDeleteBtn");
  newCommentDeleteBtn.addEventListener("click", handleDeleteComment);
};
const handleSubmit = async (event) => {
  event.preventDefault(); // 브라우저가 항상 하는 동작을 멈추게함
  const textarea = form.querySelector("textarea");
  const text = textarea.value;
  const videoId = videoContainer.dataset.id;
  if (text === "") {
    return;
  }
  const response = await fetch(`/api/videos/${videoId}/comment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });
  if (response.status === 201) {
    textarea.value = "";
    const { newCommentId } = await response.json();
    addComment(text, newCommentId);
  }
};

const handleDeleteComment = async (event) => {
  const comment = event.target.parentNode;
  const commentId = comment.dataset.id;

  const response = await fetch(`/api/comments/${commentId}`, {
    method: "DELETE",
  });
  if (response.status === 201) {
    comment.parentNode.removeChild(comment);
  }
};

if (form) {
  form.addEventListener("submit", handleSubmit);
}
if (deleteCommentsBtn) {
  console.log(deleteCommentsBtn);
  deleteCommentsBtn.forEach((deleteCommentBtn) => {
    deleteCommentBtn.addEventListener("click", handleDeleteComment);
  });
}
