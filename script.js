function scrollToBlog() {
  document.getElementById("blog").scrollIntoView({
    behavior: "smooth"
  });
}

const cards = document.querySelectorAll(".card");

function revealOnScroll() {
  const trigger = window.innerHeight * 0.85;

  cards.forEach(card => {
    const top = card.getBoundingClientRect().top;
    if (top < trigger) {
      card.classList.add("show");
    }
  });
}

window.addEventListener("scroll", revealOnScroll);
window.addEventListener("load", revealOnScroll);
