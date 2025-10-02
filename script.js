// Inserting Trending Shows
for (let i = 1; i <= 10; i++) {
    document.querySelector(".trendingShows").insertAdjacentHTML("beforeend", `<div>
                        <img src="assets/images/${i}.webp" alt="No. ${i} Trending Show">
                        <span>${i}</span>
                    </div>`)
}




// Inserting faqs and their answers in respecticve sections
async function getFaqs() {
    let a = await fetch("faqs.json")
    let response = await a.json()
    let answers = response.Answers
    let questions = response.Questions
    for (const key in questions) {
        const question = questions[key];
        const answer = answers[key]
        let p1, p2
        if (typeof answer == "object") {
            p1 = answer.a
            p2 = answer.b
        }
        else {
            p1 = answer
        }
        let faqs = document.querySelector(".faqs")
        faqs.insertAdjacentHTML("beforeend", `<li class="faq">
                        <button class="question">
                            <h3>${question}</h3>
                            <img src="assets/svgs/plus.svg" alt="plus-icon">
                        </button>
                        <div class="answer">
                            <p>
                                ${p1}
                            </p>
                        </div>
                    </li>`)
        if (typeof p2 != "undefined") {
            faqs.querySelectorAll(".answer")[key - 1].insertAdjacentHTML("beforeend", `<p>${p2}</p>`)
        }

    }
}
getFaqs().then(() => {
    // Transition of plus<->close icon
    let faqs = document.querySelectorAll(".faq")
    faqs.forEach(faq => {
        let img = faq.querySelector("button").querySelector("img")
        faq.addEventListener("click", () => {
            let rt = parseInt(getComputedStyle(img).rotate)
            img.style.rotate = rt === 0 ? `45deg` : '0deg'
            console.log(rt)

            // To Show/Hide Answer
            faq.querySelector(".answer").classList.toggle("showAnswer")
        })
    });
})

// Adding links to footer
async function getLinks() {
    let a = await fetch("links.txt")
    let response = (await a.text()).toString().trim()
    let links = response.split("\n")
    links.forEach(link => {
        document.querySelector(".links").insertAdjacentHTML("beforeend", `<a href="#">${link}</a>`)
    });
}
getLinks()









