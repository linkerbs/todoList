//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose")

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://tako:kiminitodoke@cluster0.rwqnr.mongodb.net/<todolistDB>?retryWrites=true&w=majority",{ useNewUrlParser: true,useUnifiedTopology: true })

const itemsSchema = {
  name: String
}

const Item = mongoose.model("Item", itemsSchema)

const comer = new Item({
  name : "Comer"
})

const trabajar = new Item({
  name : "Trabajar"
})

const jugar = new Item({
  name : "Jugar"
})

const defaultItems = [comer,trabajar,jugar]

const listSchema = {
  name: String,
  items: [itemsSchema]
}

const List = mongoose.model("List",listSchema)

app.get("/", function(req, res) {
  Item.find({},function (err,foundItems) {

    if (foundItems.length == 0) {
      Item.insertMany(defaultItems,function(err){
        if (err) {
          console.log(err)
        }else{console.log("Ta bien");}
      })
    }
    res.render("list", {listTitle: "Today", newListItems: foundItems});
  }) 

  

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const messi =  new Item({
    name : itemName
  })
  if (listName == "Today") {
    messi.save()
    res.redirect("/")
  } else {
    List.findOne({name: listName}, function (err,foundList) {
      foundList.items.push(messi)
      foundList.save()
      res.redirect("/" + listName)
    })
  }
  

});

app.post("/delete", function (req,res) {
  const checked = req.body.checkbox
  const listName = req.body.listName;
  if(listName === "Today"){
  Item.deleteOne({ _id: checked }, function (err) {
    if (err) {return handleError(err)}
    else{
      res.redirect("/")
    }
  });}else{
    List.findOneAndUpdate({name: listName}, {$pull : {items:{_id: checked}}},function (err,foundList) {
        if(!err){
          res.redirect("/" + listName)
        }
    })
  }
})

app.get("/:customListName", function (req,res) {
  const customListName = (req.params.customListName);
  List.findOne({name: customListName},function (err,foundList) {
    if (!err) {
      if (foundList) {
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items})
      }else{
          const list = new List({
          name : customListName,
          items: defaultItems
        })
      
        list.save()
        res.redirect("/" + customListName)
      }
    }else{console.log(err)}
  })


})

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
