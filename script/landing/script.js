const $ = tag => document.querySelector(tag);

const isValid = mail => {
    //I hate these things with a passion
    const regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    return regex.test(mail);
}

const handleValidMail = () => {
    $(".js_thanks").classList.remove("u-hidden");
    $(".js_email_input").classList.add("u-hidden");
    $(".js_submit").classList.add("u-hidden");
    $(".js_error").classList.add('u-hidden');
}

const handleInvalidMail = () => {
    $(".js_error").classList.remove('u-hidden')
}

const validateEmail = () => {
    if (isValid($(".js_email_input").value)) {
        handleValidMail();

    } else {
        handleInvalidMail();
    }
}


const main = () => {
    const modal = $(".js-modal");
    $(".js-open-modal__mobile").addEventListener('click', () => {
        $(".js-modal").style.display = "block"
    })


    $(".js-close-button").addEventListener('click', () => {
        modal.style.display = "none"
    })

    window.addEventListener('click', (event) => {
        if (event.target == modal) {
            modal.style.display = "none"
        }
    })

    $(".js_submit").addEventListener('click', (e) => {
        e.preventDefault();
        validateEmail();
    })

}

document.addEventListener('DOMContentLoaded', () => main());