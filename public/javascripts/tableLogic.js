// document.addEventListener('DOMContentLoaded', bindFormSubmit, false);
$(document).ready(function() {
    bindEditButtons();
    bindDeleteButtons();
    bindFormSubmit();
});

function bindEditButtons() {
    $(".fa-pencil").each(function() {
        addButtonListener(this, editRow);
    });
}

function bindDeleteButtons() {
    $(".fa-trash").each(function() {
        addButtonListener(this, deleteRow);
     });

}

function addButtonListener(source, action) {
    var buttonId = "#" + source.id;
    var oldSize = parseFloat($(buttonId).css('font-size'));
    var newSize = oldSize * 1.1;

    $(buttonId).hover(function() {
        // hover over
        $(this).css('cursor', 'pointer');
        $(this).animate({fontSize: newSize}, 200);
    }, function() {
        // hover out
        $(this).animate({fontSize: oldSize}, 200);
      
    });

    $(buttonId).click(function() {
        action(this);
    });
}

function bindFormSubmit() {
    $("#btn-submit").click(function(event) {
          event.preventDefault();
          var name = document.getElementById("inputForm").elements["name"].value;
          var reps = document.getElementById("inputForm").elements["reps"].value;
          var weight = document.getElementById("inputForm").elements["weight"].value;
          var date = document.getElementById("inputForm").elements["date"].value;
          var lbs = document.getElementById("inputForm").elements["lbs"].checked;
          
          if (name == "") {
              return;
          }

          reps = reps || 0;
          weight = weight || 0;
          date = date || "0000-00-00";

          var url = "/insert";
          var payload = {name: name, reps: reps, weight: weight, date: date, lbs: lbs};
          
          $.ajax({
            type: "POST",
            url: url,
            data: payload,
            success: function(response) {
                var newRow = "<tr id=\"workout-" + response.id + "\">";
                newRow += newColumn("name", response.name);
                newRow += newColumn("reps", response.reps);
                newRow += newColumn("weight", response.weight);
                newRow += newColumn("date", response.date);
                newRow += newColumn("lbs", response.lbs);
                newRow += "<td id='wo-tools-"+response.id+"' class='tableTools'>";
                newRow += "<i id='edit-" + response.id + "' class='"+editIcon+"'></i>";
                newRow += "<i id='delete-" + response.id + "' class='"+deleteIcon+"'></i>";
                $('table#sqlTable' + ' tbody').append(newRow);
                
                var delBtn = $("#delete-"+response.id);
                var edtBtn = $("#edit-"+response.id);
                addButtonListener(delBtn[0], deleteRow);
                addButtonListener(edtBtn[0], editRow);
            },
            error: function(response) {
                console.log("Something went wrong...");
                console.log(response);
            }
          });
    });
}

function newColumn(title, value) {
    return '<td contenteditable="false" class="' + title + '">' + value + '</td>';
}

function editRow(source) {
    var id = source.id.replace("edit-", "");
    toggleRowEditable(id, true, function(){});   

}

function toggleRowEditable(rowId, editMode, callback) {
    var container = $('#workout-'+rowId);
    var row = $('table#sqlTable tr#workout-'+rowId);
    var name = $(row).find(".name")[0];
    var reps = $(row).find(".reps")[0];
    var weight = $(row).find(".weight")[0];
    var date = $(row).find(".date")[0];
    var lbs = $(row).find(".lbs")[0];
    
    if (editMode) {
      // Make look like editable
      $(container).animate({'zoom' : 1.5}, 400);
      $(name).attr('contenteditable', 'true');
      $(reps).attr('contenteditable', 'true');
      $(weight).attr('contenteditable', 'true');
      $(date).attr('contenteditable', 'true');
      $(lbs).attr('contenteditable', 'true');

      var tools = $('#wo-tools-'+rowId);
      $(tools).html("<i id='save-"+rowId+"', class='"+saveIcon+"'></i>");
      var savBtn = $("#save-"+rowId);
      addButtonListener(savBtn[0], saveRow);
    }

    else {
      // Make look normal
      $(container).animate({'zoom' : 1}, 0);
      $(name).attr('contenteditable', 'false');
      $(reps).attr('contenteditable', 'false');
      $(weight).attr('contenteditable', 'false');
      $(date).attr('contenteditable', 'false');
      $(lbs).attr('contenteditable', 'false');

      var tools = $('#wo-tools-'+rowId);
      var replaceIcons = "<i id='edit-" + rowId + "' class='"+editIcon+"'></i>";
      replaceIcons += "<i id='delete-" + rowId + "' class='"+deleteIcon+"'></i>";
      $(tools).html(replaceIcons); 
      var delBtn = $("#delete-"+rowId);
      var edtBtn = $("#edit-"+rowId);
      addButtonListener(delBtn[0], deleteRow);
      addButtonListener(edtBtn[0], editRow);

    }

    return callback();
}

function deleteRow(source) {
    var id = source.id.replace("delete-", "");
    var url = "/delete";
    var payload = {id: id};
    
    $.ajax({
      type: "POST",
      url: url,
      data: payload,
      success: function(response) {
          console.log("Deleted: " + JSON.stringify(response));
          $('table#sqlTable tr#workout-'+response.id).remove();
      },
      error: function(response) {
          console.log("Something went wrong...");
          console.log(response);
      }
    });
}

function saveRow(source) {
    var id = source.id.replace("save-", "");
    toggleRowEditable(id, false, function() {
        var row = $('table#sqlTable tr#workout-'+id);
        var name = $($(row).find(".name")[0]).text();
        var reps = $($(row).find(".reps")[0]).text();
        var weight = $($(row).find(".weight")[0]).text();
        var date = $($(row).find(".date")[0]).text();
        var lbs = $($(row).find(".lbs")[0]).text();
       
        console.log(name);

        if (name == "") {
            return;
        }

        reps = reps || 0;
        weight = weight || 0;
        date = date || "0000-00-00";

        var url = "/update";
        var payload = {id: id, name: name, reps: reps, weight: weight, date: date, lbs: lbs};

        $.ajax({
          type: "POST",
          url: url,
          data: payload,
          success: function(response) {
              var newRow = "<tr id=\"workout-" + response.id + "\">";
              newRow += newColumn("name", response.name);
              newRow += newColumn("reps", response.reps);
              newRow += newColumn("weight", response.weight);
              newRow += newColumn("date", response.date);
              newRow += newColumn("lbs", response.lbs);
              newRow += "<td id='wo-tools-"+response.id+"' class='tableTools'>";
              newRow += "<i id='edit-" + response.id + "' class='"+editIcon+"'></i>";
              newRow += "<i id='delete-" + response.id + "' class='"+deleteIcon+"'></i>";
              
              console.log(response.name);
              $(row).replaceWith(newRow);
              
              var delBtn = $("#delete-"+response.id);
              var edtBtn = $("#edit-"+response.id);
              addButtonListener(delBtn[0], deleteRow);
              addButtonListener(edtBtn[0], editRow);
          },
          error: function(response) {
              console.log("Something went wrong...");
              console.log(response);
          }
        });
    });   
}
