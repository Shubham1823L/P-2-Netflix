Array.from(document.querySelectorAll(".signupForm")).forEach(form => {
    form.querySelector("button").addEventListener("click", async (e) => {
        e.preventDefault()
        let email = form.querySelector(".email").value
        const emailregex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (emailregex.test(email)) {
            form.querySelector("span").style.display = "none"
            form.querySelector("input").style.borderColor = "#29B872"
            let res = await fetch("/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ "email": email })
            })

            let result = await res.json()
            console.log(result)
        }
        else {
            form.querySelector("span").style.display = "block"
            form.querySelector("input").style.borderColor = "#EB3942"
        }
    })
})

Array.from(document.querySelectorAll(".signupForm")).forEach(form => {
    let btn = form.querySelector(".arrow")
    
});






Array.from(document.querySelectorAll(".closeBtn")).forEach(e => {
    e.addEventListener("click", () => {
        let dialogBox = e.parentElement
        dialogBox.style.opacity = 0
        dialogBox.style.translate = "0 100px"
        setTimeout(() => {
            dialogBox.style.display = "none"
        }, 500);

    })
});

document.querySelector(".enterOtp").addEventListener("keydown", (e) => {
    const btn = document.querySelector(".next")
    setTimeout(() => {
        if (e.target.value.length === 6) {
            btn.style.backgroundColor = "#E50815"
            btn.style.cursor = "pointer"
            btn.style.opacity = 1
        }
        else {
            btn.style.backgroundColor = "#D9D9D9"
            btn.style.cursor = "not-allowed"
            btn.style.opacity = 0.6
        }

    }, 1);
})



