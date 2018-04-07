var express    = require("express"),
    Campground = require("../models/campground"),
    Comment    = require("../models/comment"),
    middleware = require("../middleware"),
    router     = express.Router()

//NEW comment
router.get("/campgrounds/:id/comments/new", middleware.isLoggedIn, function(req, res) {
   Campground.findById(req.params.id, function(err, campground) {
       if (err) {
           console.log(err)
       } else {
            res.render("comments/new", {campground: campground});
       }
   });
});

// Create new comment
router.post("/campgrounds/:id/comments", middleware.isLoggedIn, function(req, res) {
   // lookup campground using ID
   Campground.findById(req.params.id, function(err, campground) {
      if (err) {
          console.log(err);
          res.redirect("/campgrounds")
      } else {
          // create new comment
          Comment.create(req.body.comment, function (err, comment) {
              if (err) {
                  req.flash("error", "Something went wrong")
                  console.log(err);
              } else {
                // add username and id to comment
                comment.author.id = req.user._id;
                comment.author.username = req.user.username;
                // save comment
                comment.save();
                campground.comments.push(comment);
                campground.save();
                req.flash("success", "Successfully added comment!")
                res.redirect("/campgrounds/" + campground._id);
              }
          })
      }
   });
});

//  COMMENTS EDIT ROUTE
router.get("/campgrounds/:id/comments/:comment_id/edit", middleware.checkCommentOwnership, function(req, res) {
    Campground.findById(req.params.id, function(err, foundCampground) {
        if (err || !foundCampground) {
            req.flash("error", "Campground not found");
            return res.redirect("back");
        }
        Comment.findById(req.params.comment_id, function(err, foundComment) {
            if (err || !foundComment) {
                req.flash("error", "Comment not found");
                res.redirect("back");
            } else {
                res.render("comments/edit", {campground_id: req.params.id, comment: foundComment});
            }
        });
    });
});

// COMMENTS UPDATE ROUTE
router.put("/campgrounds/:id/comments/:comment_id/", middleware.checkCommentOwnership, function(req, res) {
  Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
     if (err) {
         res.redirect("back");
     } else {
         res.redirect("/campgrounds/" + req.params.id)
     }
  });
});

// COMMENTS DESTROY ROUTE
router.delete("/campgrounds/:id/comments/:comment_id/", middleware.checkCommentOwnership, function(req, res) {
    Comment.findByIdAndRemove(req.params.comment_id, function(err) {
       if (err) {
           res.redirect("back");
       } else {
           res.redirect("/campgrounds/" + req.params.id);
       }
    });
})


module.exports = router;


