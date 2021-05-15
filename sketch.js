var dog,sadDog,happyDog, database;
var food,foodStock;
var fedTime,lastFed;
var feed,addFood;
var foodObj;

var changingGameState, readState;
var bedroomImage, gardenImage, washroomImage;

function preload(){
sadDog=loadImage("images/Dog.png");
happyDog=loadImage("images/happydog.png");

//loading the images of bedroom, garden, washroom
 bedroomImage = loadImage("images/bedroom.png");
 gardenImage = loadImage("images/Garden.png");
 washroomImage = loadImage("images/washroom.png");

}

function setup() {
  database=firebase.database();
  createCanvas(1000,1000);
  dog=createSprite(500,500,150,150);
  dog.addImage(sadDog);
  dog.scale=0.15;


  // read gameState from database
     readState = database.ref("gameState");
     readState.on("value",function(data){
       gameState = data.val();
     });


  foodObj = new Food();

  foodStock=database.ref('Food');
  foodStock.on("value",readStock);
  
  
  
  feed=createButton("Feed the dog");
  feed.position(700,95);
  feed.mousePressed(feedDog);

  addFood=createButton("Add Food");
  addFood.position(800,95);
  addFood.mousePressed(addFoods);

}

function draw() {
  background(46,139,87);
  foodObj.display();

  fedTime=database.ref('FeedTime');
  fedTime.on("value",function(data){
    lastFed=data.val();
  });
 
  fill(255,255,254);
  textSize(15);
  if(lastFed>=12){
    text("Last Feed : "+ lastFed%12 + " PM", 350,30);
   }else if(lastFed==0){
     text("Last Feed : 12 AM",350,30);
   }else{
     text("Last Feed : "+ lastFed + " AM", 350,30);
   }

   currentTime = hour();
   if(currentTime === (lastFed+1)){
      update("Playing");
      foodObj.garden();
} else if(currentTime === (lastFed + 2)){
       update("Sleeping");
       foodObj.bedroom();
} else if(currentTime > (lastFed + 2) && currentTime <= (lastFed + 4)){
       update("Bathing");
       foodObj.washroom();
} else{
  update("hungry");
  foodObj.display();
}

 // hide buttons if the state is not hungry
 if(gameState != "Hungry"){
   feed.hide();
   addFood.hide();
   //dog.remove();
 } else{
   feed.show();
   addFood.show();
   //dog.addImage(sadDog);
 }
 
  drawSprites();
}

//function to read food Stock
function readStock(data){
  food=data.val();
  foodObj.updateFoodStock(food);
}


//function to update food stock and last fed time
function feedDog(){
 // dog.addImage(happyDog);

  foodObj.updateFoodStock(foodObj.getFoodStock()-1);
  database.ref('/').update({
    food:foodObj.getFoodStock(),
    FeedTime:hour()
  })
}

//function to add food in stock
function addFoods(){
  food++;
  database.ref('/').update({
    Food:food
  })
}

// function to update gameState
function update(state){
  database.ref('/').update({
    gameState : state
  });
}