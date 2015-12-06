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

          var url = "/insert";
          var payload = {name: name, reps: reps, weight: weight, date: date, lbs: lbs};
          
          $.ajax({
            type: "POST",
            url: url,
            data: payload,
            success: function(response) {
                console.log("Response received!");
                console.log(response);
                location.reload();

            },
            error: function(response) {
                console.log("Something went wrong...");
                console.log(response);
            }
          });
    });
}
