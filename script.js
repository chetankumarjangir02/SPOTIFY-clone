console.log("lets write javaScript")
let currentSong = new Audio();
let songs;
let currFolder;
function secondsToMinutesSeconds(seconds) {
    // Calculate whole minutes and remaining seconds
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    let minutes = Math.floor(seconds / 60);
    let remainingSeconds = Math.floor(seconds % 60);

    // Ensure both minutes and seconds are two digits
    let formattedMinutes = String(minutes).padStart(2, '0');
    let formattedSeconds = String(remainingSeconds).padStart(2, '0');

    // Combine formatted minutes and seconds


    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getsongs(folder) {
    currFolder=folder
    let a = await fetch(`http://127.0.0.1:5500/${folder}/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")

     songs = []

    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }

    // show all the songsin the play list
    let songul = document.querySelector(".songlist").getElementsByTagName("ul")[0]
    songul.innerHTML=""
    for (const song of songs) {
        songul.innerHTML = songul.innerHTML + `<li>
                                <img class="invert" src="music.svg" alt="">
                                <div class="info">
                                    <div> ${song.replaceAll("%20", " ")} </div>
                                    <div>Chetan</div>
                                </div>
                                <div class="playnow">
                                    <span>playnow</span>
                                    <img class="invert" src="play.svg" alt="">
                                </div> </li>`;
    }
    // attach element listner to each song
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            console.log(e.querySelector(".info").firstElementChild.innerHTML)
            playmusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })
    })
}
const playmusic = (track, pause = false) => {
    currentSong.src = `/${currFolder}/` + track
    if (!pause) {
        currentSong.play()
        play.src = "pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"
}

async function displayAlbums(){
    let a = await fetch(`http://127.0.0.1:5500/songs/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors=div.getElementsByTagName("a")
    let cardContainer=document.querySelector(".cardContainer")
    let array =Array.from(anchors)
        for (let index = 0; index < array.length; index++) {
            const e = array[index];
        if(e.href.includes("/songs")){
            let folder=e.href.split("/").slice(-2)[0]
            // /get the meta data of the folder
            let a = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`)
            let response = await a.json();
            // console.log(response)
            cardContainer.innerHTML=cardContainer.innerHTML+ ` <div data-folder="${folder}"class="card">
                        <div class="play">
                           <img src="play button.png" alt="">
                        </div>
                        <img src="/songs/${folder}/cover.jpg" alt="">
                        <h2>${folder.title}</h2>
                        <p>${folder.description}</p>
                    </div>`

        }
    }
}
async function main() {
    // get the list of songs
    await getsongs("songs/ncs")
    playmusic(songs[0], true)
    
    // dsplay allthe albums on thr page
     displayAlbums()
    
    // Attach an event listner to play ,next or pervious
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "pause.svg"
        }
        else {
            currentSong.pause()
            play.src = "play.svg"
        }
    })

    // listen for time update event
    currentSong.addEventListener("timeupdate", () => {
        // console.log(currentSong.currentTime, currentSong.duration)
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)}/${secondsToMinutesSeconds(currentSong.duration)}`
        // seek
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%"
    })

    // add an evenet listner to seek bar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector(".circle").style.left = percent + "%"
        currentSong.currentTime = (currentSong.duration) * percent / 100
    })

    // add anevent listner for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })
    // add an event listner to colse closebutton
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    })
    // add an event listner to previous and next
    previous.addEventListener("click",()=>{
        currentSong.pause()

        console.log("previous click")
        
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if((index-1)>=0){
            playmusic(songs[index-1])
        }
    })
    next.addEventListener("click",()=>{
        currentSong.pause()
        console.log("next click")
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if((index+1)<songs.length){
            playmusic(songs[index+1])
        }
    })
    // add an event to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change",(e)=>{
        console.log("setting volume to",e.target.value,"/ 100")
        currentSong.volume=parseInt(e.target.value)/100
    })

    // load the playlist whenever the card is clicked
    // load the playlist whenever the card is clicked
   Array.from( document.getElementsByClassName("card")).forEach(e=>{
    e.addEventListener("click", async item=>{
        console.log(item,item.currentTarget.dataset)
        songs=await getsongs(`songs/${item.currentTarget.dataset.folder}`)
       
    })
})
// add event lisnter to mute volume
document.querySelector(".volume>img").addEventListener("click",e=>{
    if(e.target.src.includes("volume.svg")){
        e.target.src=e.target.src.replace("volume.svg","mute.svg")
        currentSong.volume=0;
        document.querySelector(".range").getElementsByTagName("input")[0].value=0;
    }else{
        e.target.src=e.target.src.replace("mute.svg","volume.svg")
         currentSong.volume=.10;
         document.querySelector(".range").getElementsByTagName("input")[0].value=50;
    }
})

}

main()