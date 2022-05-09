const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");
const app = express();

app.set('view engine', 'ejs');
// ejs use
app.use(bodyParser.urlencoded({extended: true}));
// use the info in body HTML

app.use(express.static("public"));
// uses static css
mongoose.connect("mongodb+srv://admin-sonia:Test123@cluster0.vqulx.mongodb.net/todolistDB");
// connect to mongoose
const itemSchema = {
  name: String
};
// schema for mongoose
const Item = mongoose.model("Item", itemSchema);
const day = date.getDate();

const item1 = new Item ({name: "Welcome to your ToDoList"});
const item2 = new Item ({name: "Hit the + button to add more items."});
const item3 = new Item ({name: "<--Hit this to delete an item."});
// 3 documents which will appear
const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemSchema]
};
const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {

Item.find({}, function(err, foundItems){

  if(foundItems.length === 0){
    // see if there are any items
    Item.insertMany(defaultItems, function(err){
      if(err){
        console.log(err);
        // if not it adds into our collection
      }else {
        console.log("succesfully");
      }
    });
    res.redirect("/");
  }else{
  res.render("list", {listTitle: day, newListItem: foundItems});
}
})
});
// render the found item, {} find them all

app.get("/:customList", function(req, res){
  const customList = req.params.customList;

  List.findOne({ name: customList}, function(err, foundList){
    if(!err){
      if(!foundList){
        // create a new list
        const list = new List({
          name: customList,
          items: defaultItems
        });
        list.save();
        res.redirect("/"+ customList);
        }else{
        // show an existing list
        res.render("list", {listTitle: foundList.name, newListItem:foundList.items });
      }
    }
  });
});
// it creates a new list based on what is searched

app.post("/", function(req, res){
// JS function for posting the date
let itemName = req.body.newItem;
  // saves the info someone puts in input
  const listName = req.body.list;
  const item =  new Item({name: itemName});
  if(listName === day){
    item.save();
    // saves and posts the text in the input
    res.redirect("/");
    // posts on the page the new item
  } else{
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      // it searches for the list name and pushes the item into that array
      res.redirect("/"+listName);
    });
  }
});

app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
  if(listName === day){
    Item.findByIdAndRemove(checkedItemId, function(err){
      if(!err){
        console.log("succesfully");
        res.redirect("/");
      }
    });
  }else {
    List.findOneAndUpdate({name: listName}, {$pull:{items:{_id:checkedItemId}}}, function(err, foundList){
      if(!err){
        res.redirect("/"+listName);
      }
    });
    // searches through the list for the item that is checked and it pulls it
  }

});
// we post the data we get from webpage to our server


app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server is running on 3000 port.");
});
