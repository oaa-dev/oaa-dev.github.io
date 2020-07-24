
$(document).ready(function(){
    /* maps */
    var map = L.map('map').setView([14.2471, 121.1367], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    /* particles */
    particlesJS("particles-js", {
        "particles": {
            "number": {
                "value": 120,
                "density": {
                    "enable": true,
                    "value_area": 800
                }
            },
            "color": {
                "value": "#A9A9A9"
            },
            "shape": {
                "type": "circle",
                "stroke": {
                    "width": 0,
                    "color": "#000000"
                },
                "polygon": {
                    "nb_sides": 5
                }
            },
            "opacity": {
                "value": 0.5,
                "random": false,
                "anim": {
                    "enable": false,
                    "speed": 1,
                    "opacity_min": 0.1,
                    "sync": false
                }
            },
            "size": {
                "value": 3,
                "random": true,
                "anim": {
                    "enable": false,
                    "speed": 40,
                    "size_min": 0.1,
                    "sync": false
                }
            },
            "line_linked": {
                "enable": true,
                "distance": 150,
                "color": "#A9A9A9",
                "opacity": 0.4,
                "width": 1.5
            },
            "move": {
                "enable": true,
                "speed": 2,
                "direction": "none",
                "random": false,
                "straight": false,
                "out_mode": "out",
                "bounce": false,
                "attract": {
                    "enable": false,
                    "rotateX": 600,
                    "rotateY": 1200
                }
            }
        },
        "interactivity": {
            "detect_on": "window",
            "events": {
            "onhover": {
                "enable": true,
                "mode": "grab"
            },
            "onclick": {
                "enable": true,
                "mode": "repulse"
            },
            "resize": true
            },
            "modes": {
                "grab": {
                    "distance": 140,
                    "line_linked": {
                        "opacity": 1
                    }
                },
                "bubble": {
                    "distance": 400,
                    "size": 40,
                    "duration": 2,
                    "opacity": 8,
                    "speed": 3
                },
                "repulse": {
                    "distance": 200,
                    "duration": 0.4
                },
                "push": {
                    "particles_nb": 1
                },
                "remove": {
                    "particles_nb": 2
                }
            }
        },
        "retina_detect": true
    });

    /* transition */
    AOS.init();

    // chatbot
    $(".head").click(function() {
        $('.message-box').addClass('popout').css({display: (this.tog ^= 1) ? 'block' : 'none' });
        $('#message').focus();
    }); 
    
    $(document).keypress(function (e) {
        var key = e.which;
        if(key == 13){
            $('#send').click();
            return false;  
        }
    });   

    $('#send').on('click', function(){
        const message = $('#message').val();

        $('.conversations').append(`<div class="user popout"><img src="./img/user.png" alt=""><p>${message}</p></div>`)
        $('.user').css('outline', 'none').attr("tabindex", -1).focus();

        getResponse(message).then(resolve => {
            const {data, analysis} = resolve;

            const answer = renderData(data.Answer)

            setTimeout(() => {
                // console.log(resolve)
                if(analysis >= 0.7){
                    $('.conversations').append(`<div class="bot popout"><img src="./img/alien.jpg" alt=""><p>${answer}</p></div>`);
                }if(analysis >= 0.5 && analysis < 0.7){
                    $('.conversations').append(`<div class="bot popout"><img src="./img/alien.jpg" alt=""><p>Did you mean ${data.Question}? ${answer}</p></div>`);
                }if(analysis < 0.5){
                    $('.conversations').append(`<div class="bot popout"><img src="./img/alien.jpg" alt=""><p>Sorry, I dont understand you.</p></div>`);
                }

                $('.bot').css('outline', 'none').attr("tabindex", -1).focus();

                $('#message').focus();
                $('#message').val("");
            }, 2500);
        }).catch(reject => {
            console.log(reject)
        });
    });
});

const getResponse = (question) => {
    return new Promise((resolve, reject) => {
        let threshold = 0;
        let response = [];
        
        QNA.forEach((data, index) => {
            const percentage = stringSimilarity.compareTwoStrings(question.toLowerCase().replace(/[^\w\s]/gi, ''), data.Question.toLowerCase().replace(/[^\w\s]/gi, ''))
            if(percentage >= threshold){
                threshold = percentage;
                response = {"data" : data, "analysis": percentage};
            }
        });

        resolve(response)
    });
}

const renderData = (response) => {
    let today = new Date();
    let dd = String(today.getDate()).padStart(2, '0');
    let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    let yyyy = today.getFullYear();
    let message = "";
    
    let data = {
        '_datetoday_' : mm + '/' + dd + '/' + yyyy,
        '_monthtoday_' : mm,
        '_yeartoday_' : yyyy,
        '_time_' : `${today.getHours()}:${today.getMinutes()}:${today.getSeconds()}`,
        '_botName_' : 'Chatbot 101'
    };
    
    for(key of Object.keys(data)){
        if(response.search(key) != -1){
            message = response.replace(key, data[key])
            break;
        }
    }
    
    return (message) ? message : response;
}