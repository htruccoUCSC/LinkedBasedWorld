class Engine {

    static load(...args) {
        window.onload = () => new Engine(...args);
    }

    constructor(firstSceneClass, storyDataUrl) {

        this.firstSceneClass = firstSceneClass;
        this.storyDataUrl = storyDataUrl;

        this.header = document.body.appendChild(document.createElement("h1"));
        this.clock = document.body.appendChild(document.createElement("h1"));
        this.clock.style.float    = "right";
        this.clock.style.position = "relative";
        this.clock.style.top      = "-2.5em";
        this.output = document.body.appendChild(document.createElement("div"));
        this.actionsContainer = document.body.appendChild(document.createElement("div"));

        fetch(storyDataUrl).then(
            (response) => response.json()
        ).then(
            (json) => {
                this.storyData = json;
                this.gotoScene(firstSceneClass)
            }
        );
    }

    gotoScene(sceneClass, data) {
        this.scene = new sceneClass(this);
        this.scene.create(data);
    }

    addRide(ride) {
        let rideDiv = document.createElement('div');
        const button = document.createElement('button');
        button.innerText = ride.Text;
        rideDiv.appendChild(button);
        const label = document.createElement('div');
        label.innerText = `Wait Time: ${ride.Time / 60 | 0 > 0 ? (ride.Time / 60 | 0) + ":" : ""}${ride.Time % 60 > 9 ? ride.Time % 60 : '0' + ride.Time % 60} minutes`
        rideDiv.appendChild(label);
        this.actionsContainer.appendChild(rideDiv);
        button.onclick = () => { 
            this.scene.handleRide(ride);
        }
    }

    addChoice(action, data) {
        let button = this.actionsContainer.appendChild(document.createElement("button"));
        button.innerText = action;
        button.onclick = () => {
            while(this.actionsContainer.firstChild) {
                this.actionsContainer.removeChild(this.actionsContainer.firstChild)
            }
            this.scene.handleChoice(data);
        }
    }

    setTitle(title) {
        document.title = title;
        this.header.innerText = title;
    }

    setClock (time) {
        let hour = time / 60 | 0;
        let minute = time % 60;
        this.clock.innerText = `${hour % 12 == 0 ? 12 : hour % 12}:${minute > 9 ? minute: '0' + minute}${hour % 24 < 12 ? "am" : "pm"}`;
    }

    show(msg) {
        let div = document.createElement("div");
        div.innerHTML = msg;
        this.output.appendChild(div);
    }
}

class Scene {
    constructor(engine) {
        this.engine = engine;
    }

    create() { }

    update() { }

    handleChoice(action) {
        console.warn('no choice handler on scene ', this);
    }
}