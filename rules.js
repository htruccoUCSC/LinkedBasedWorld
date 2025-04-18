let time = 0;
let closingTime = 0;
let score = 0;
let playerItems = [];
let collectedItems = new Set();
let carousel = false;
let shortcuts = false;
class Start extends Scene {
    create () {
        this.engine.setTitle(this.engine.storyData.Title); // TODO: replace this text using this.engine.storyData to find the story title
        this.engine.setClock(this.engine.storyData.InitialTime);
        this.engine.setScore(0);
        time = this.engine.storyData.InitialTime;
        closingTime = this.engine.storyData.ClosingTime;
        this.engine.addChoice("Begin the story");
    }

    handleChoice () {
        const key = this.engine.storyData.InitialLocation;
        this.engine.gotoScene(this.engine.storyData.Locations[key] ? ItemLocation : Location, this.engine.storyData.InitialLocation); // TODO: replace this text by the initial location of the story
    }
}

class Location extends Scene {
    create (key) {
        this.key = key;
        let locationData = this.engine.storyData.Locations[key]; // TODO: use `key` to get the data object for the current story location
        this.engine.show(locationData.Body); // TODO: replace this text by the Body of the location data
        if (locationData.Rides && locationData.Rides.length > 0) {
            for (let ride of locationData.Rides) {
                this.engine.addRide(ride);
            }
        }
        if(locationData.Choices && locationData.Choices.length > 0) { // TODO: check if the location has any Choices
            for(let choice of locationData.Choices) { // TODO: loop over the location's Choices
                this.engine.addChoice(choice.Text, choice); // TODO: use the Text of the choice
            }
            if (shortcuts && locationData.HiddenChoices && locationData.HiddenChoices.length > 0) {
                for(let hiddenChoice of locationData.HiddenChoices) { // TODO: loop over the location's Choices
                    this.engine.addChoice(hiddenChoice.Text, hiddenChoice); // TODO: use the Text of the choice
                }
            } 
        } else {
            this.engine.addChoice("The end.");
        }
    }

    handleTime (minutes=0) {
        time += minutes;
        if (time >= closingTime) {
            this.engine.setClock(closingTime)
            return time == closingTime ? 2 : 0;
        } else {
            this.engine.setClock(time);
            return 1;
        }
    }

    handleRide (ride) {
        if (ride ){
            let x = 0;
            // Lock and Key puzzle where the fast pass essentially makes Star Wars viable
            let fpi = playerItems.findIndex(item => item instanceof FastPass && ride.Text.includes(item.ride));
            if (fpi != -1) {
                x = this.handleTime(15);
                playerItems.splice(fpi, 1);
                this.engine.show("&gt; Used a FastPass for this ride");
            } else {
                x = this.handleTime(ride.Time);
            }
            if (x) {
                this.engine.show("&gt; " + (ride.Text.includes("Ride") ? "Rode" + ride.Text.replace("Ride", "") : "Visited" + ride.Text.replace("Visit", "")));
                score += ride.Score;
                this.engine.setScore(score);
            }
            if (x != 1) {
                this.engine.show(time >= 1440 ? "&gt; Parks closing, time to head home": "&gt; You got tired in line and decided to head home");
                this.engine.clearActions();
                this.engine.addChoice(this.engine.storyData.ExitPath.Text, this.engine.storyData.ExitPath);
            } 
        }
    }

    handleChoice (choice) {
        if (choice) {
            let madeChoice;
            if (carousel) {
                let x = this.engine.storyData.Locations[this.key].Choices.length;
                madeChoice = this.engine.storyData.Locations[this.key].Choices[Math.random() * x | 0]
            } else {
                madeChoice = choice;
            }
            this.engine.show("&gt; "+madeChoice.Text);
            this.engine.gotoScene(this.engine.storyData.Locations[madeChoice.Target] ? ItemLocation : Location, madeChoice.Target);
            if (this.handleTime(15) != 1 && madeChoice != this.engine.storyData.ExitPath && madeChoice.Target != "Home") {
                this.engine.show("&gt; Time to head home");
                this.engine.clearActions();
                this.engine.addChoice(this.engine.storyData.ExitPath.Text, this.engine.storyData.ExitPath);
            } else if (madeChoice.Target == "Home") {
                score += 5000;
                this.engine.setScore(score);
            }
        } else {
            this.engine.gotoScene(End);
        }
    }
}

//Data driven Item System
class GameWorldItem {
    constructor (item) {
        this.name = item.Name;
        this.description = item.Description;
        this.visible = item.Visible;
    }
}

class FastPass extends GameWorldItem {
    constructor (item) {
        super(item);
        this.ride = item.Ride;
    }
}

//Location-specific: Consuming a consumable allows for the player to stay on the map longer
class Consumable extends GameWorldItem {
    constructor (item) {
        super(item);
        closingTime += 180;
    }
}

//Togglable Carousel mode
class Toggle extends GameWorldItem {
    constructor (item) {
        super(item);
        carousel = true;
    }
}

//Flashlight mechanic allowing the player to access new paths
class HallPass extends GameWorldItem {
    constructor (item) {
        super(item);
        shortcuts = true;
    }
}

class ItemLocation extends Location {
    create (key) {
        super.create(key);
        let locationData = this.engine.storyData.Locations[key];
        if (locationData.Items && locationData.Items.length > 0) {
            for (let item of locationData.Items) {
                if (item.Visible && !collectedItems.has(item)) {
                    this.engine.addItem(item);
                }
            }
        }
    }

    handleItem (item) {
        this.engine.show("&gt; You picked up the " + item.Name);
        collectedItems.add(item);
        switch(item.Type) {
            case "FastPass":
                playerItems.push(new FastPass(item));
                break;
            case "Consumable":
                playerItems.push(new Consumable(item));
                break;
            case "Toggle":
                playerItems.push(new Toggle(item));
                break;
            case "HallPass":
                playerItems.push(new HallPass(item));
                break;
            default:
                playerItems.push(new GameWorldItem(item));
        }
    }
}

class End extends Scene {
    create () {
        this.engine.show("<hr>");
        this.engine.show(this.engine.storyData.Credits);
    }
}

Engine.load(Start, 'myStory.json');