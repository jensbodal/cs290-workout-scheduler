document.addEventListener('DOMContentLoaded', bindFormSubmit, false);

function bindFormSubmit() {
    $("#btn-submit").click(function(event) {
          event.preventDefault();
          var name = document.getElementById("inputForm").elements["name"].value;
          var reps = document.getElementById("inputForm").elements["reps"].value;
          var weight = document.getElementById("inputForm").elements["weight"].value;
          var date = document.getElementById("inputForm").elements["date"].value;
          var lbs = document.getElementById("inputForm").elements["lbs"].checked;
          
          console.log(lbs);

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
                console.log("Response received!");
                console.log(response);
        

                var newRow = "<tr id=\"" + response.id + "\">";
                newRow += newColumn("name", response.name);
                newRow += newColumn("reps", response.reps);
                newRow += newColumn("weight", response.weight);
                newRow += newColumn("date", response.date);
                newRow += newColumn("lbs", response.lbs);

                $('#sqlTable' + ' tbody').append(newRow);
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


