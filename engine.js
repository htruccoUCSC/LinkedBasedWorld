class Engine {

    static load(...args) {
        window.onload = () => new Engine(...args);
    }

    constructor(firstSceneClass, storyDataUrl) {

        this.firstSceneClass = firstSceneClass;
        this.storyDataUrl = storyDataUrl;

        this.header = document.body.appendChild(document.createElement("h1"));
        this.header.classList.add("header");

        this.clock = document.body.appendChild(document.createElement("h1"));
        this.clock.classList.add("clock");

        this.score = document.body.appendChild(document.createElement("h1"));
        this.score.classList.add("score");

        this.output = document.body.appendChild(document.createElement("div"));
        this.output.classList.add("output");

        this.actionsContainer = document.body.appendChild(document.createElement("div"));
        this.actionsContainer.classList.add("actions-container");

        this.itemsContainer = document.createElement("div");
        this.itemsContainer.classList.add("items-container");
        this.actionsContainer.appendChild(this.itemsContainer);

        this.ridesContainer = document.createElement("div");
        this.ridesContainer.classList.add("rides-container");
        this.actionsContainer.appendChild(this.ridesContainer);

        this.choicesContainer = document.createElement("div");
        this.choicesContainer.classList.add("choices-container");
        this.actionsContainer.appendChild(this.choicesContainer);

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
        this.clearActions();
        this.scene = new sceneClass(this);
        this.scene.create(data);
    }

    addItem (item) {
        const itemDiv = document.createElement("div");
        const button = document.createElement("button");
        button.innerText = "Pick up " + item.Name;
        itemDiv.appendChild(button);

        const label = document.createElement("div");
        label.classList.add("item-label"); 
        label.innerText = item.Description;
        itemDiv.appendChild(label);

        this.itemsContainer.appendChild(itemDiv);
        button.onclick = () => {
            this.scene.handleItem(item);
            this.itemsContainer.removeChild(itemDiv);
        }
    }

    addRide(ride) {
        const rideDiv = document.createElement("div");
        const button = document.createElement("button");
        button.innerText = ride.Text;
        rideDiv.appendChild(button);

        const label = document.createElement("div");
        label.classList.add("ride-label");
        let hour = ride.Time / 60 | 0;
        let minute = ride.Time % 60;
        label.innerText = `Wait Time: ${hour > 0 ? hour + (hour > 1 ? " hours" : " hour") : ""} ${minute > 1 ? minute + " minutes" : (minute > 0 ? minute + " minute" : "")}`
        rideDiv.appendChild(label);

        this.ridesContainer.appendChild(rideDiv);
        button.onclick = () => { 
            this.scene.handleRide(ride);
        }
    }

    addChoice(action, data) {
        const button = document.createElement("button");
        button.innerText = action;
        if (data && data.Hidden) {
            console.log(data);
            button.classList.add("hidden-label");
        }
        this.choicesContainer.appendChild(button)
        
        

        button.onclick = () => {
            this.clearActions();
            this.scene.handleChoice(data);
        }
    }

    clearActions() {
        this.clearRides();
        this.clearChoices();
        this.clearItems();
    }
    
    clearRides() {
        this.ridesContainer.innerHTML = "";
    }

    clearChoices() {
        this.choicesContainer.innerHTML = "";
    }

    clearItems() {
        this.itemsContainer.innerHTML = "";
    }

    setTitle(title) {
        document.title = title;
        this.header.innerText = title;
    }

    setClock (time) {
        let hour = time / 60 | 0;
        let minute = time % 60;
        this.clock.innerText = `${hour % 12 == 0 ? 12 : hour % 12}:${minute > 9 ? minute: "0" + minute}${hour % 24 < 12 ? "am" : "pm"}`;
    }

    setScore (score) {
        this.score.innerText = "Score: " + score;
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
        console.warn("no choice handler on scene ", this);
    }
}