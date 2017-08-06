(function () {
  "use strict";

  angular.module("Election.App", [
    "Election.Component"
  ]);
})();

//Election Component
(function () {
  "use strict";

  angular.module("Election.Component", [
    "Election.Candidate.Component",
    "Election.Results.Component",
    "Election.Vote.Component"
  ])

  .component("tfElection", {
    templateUrl: "App/Election.Component.Template.html",
    controller: ElectionController,
    bindings: {
      // getCandidatePercentage: "&",
    },
  });

	ElectionController.$inject = [ "$timeout" ];

	function ElectionController($timeout){
		var ctrl = this;
		ctrl.candidates = [];
    ctrl.total = 0;
    // sorts candidates from greatest votes to least
    ctrl.sortCandidates = function () {
      ctrl.candidates.sort(function(a,b){
        return b.votes - a.votes;
      });
    };
    // creates a new candidate and adds to ctrl.candidates array
		ctrl.onCandidateCreate = function(candidate) {
			ctrl.candidates.push(candidate);
    };
    // deletes a candidate from ctrl.candidates array
		ctrl.onCandidateDelete = function(candidate) {
      var index = ctrl.candidates.indexOf(candidate.$candidate);
      ctrl.total -= candidate.$candidate.votes;
			ctrl.candidates.splice(index, 1);
      // after candidate is deleted, forEach calculates new percent
      angular.forEach(ctrl.candidates, function(value, key) {
        ctrl.candidates[key].percent = ((ctrl.candidates[key].votes / ctrl.total) * 100).toFixed(2);
      });
		};
		ctrl.onVote = function(candidate) {
			var index = ctrl.candidates.indexOf(candidate);
			ctrl.candidates[index].votes += 1;
      ctrl.total += 1;
      // after vote is added to candidate # of votes and total # of votes, forEach calculates new percent
      angular.forEach(ctrl.candidates, function(value, key) {
        ctrl.candidates[key].percent = ((ctrl.candidates[key].votes / ctrl.total) * 100).toFixed(2);
      });
		};
    // runs on initialization
		ctrl.$onInit = function() {
			// Example Initial Data Request
			// Mimic 1 seconds ajax call
			$timeout(function(){
				ctrl.candidates = [
					{ name: "Puppies", color: "blue", votes: 65, percent: ((65/132) * 100).toFixed(2), image: "http://cdn3-www.dogtime.com/assets/uploads/gallery/30-impossibly-cute-puppies/impossibly-cute-puppy-30.jpg"},
					{ name: "Kittens", color: "red", votes: 62, percent: ((62/132) * 100).toFixed(2), image: "https://static1.squarespace.com/static/54e8ba93e4b07c3f655b452e/t/57cf3d2846c3c4d2933a9d28/1474332420480/DSC_5454.jpg"},
					{ name: "Pandas", color: "green", votes: 5, percent: ((5/132) * 100).toFixed(2), image: "https://img-s3.onedio.com/id-56fa7e04cc6d04b27b2697a1/rev-1/raw/s-4ff0ab4f0d895caa5d332a5c95f6888872af36dd.jpg"}
				];
        // gets the starting total # of votes after initial data request
        // ctrl.total = 0;
        angular.forEach(ctrl.candidates, function(value, key) {
          ctrl.total += value.votes;
          return ctrl.total;
        });
        // sorts candidates into order
        ctrl.sortCandidates();
			}, 1000);
		};  // end $onInit
	}  // end ElectionController
})();  // end Election Component

//Results Component
(function () {
  "use strict";

  angular.module("Election.Results.Component", [])
    .component("tfElectionResults", {
        templateUrl: "App/Election.Results.Component.Template.html",
        controller: ResultsController,
        require: {
          parent: "^^tfElection"
        },
        bindings: {
            candidates: "<",
            getCandidatePercentage: "&",
        }
    });

	ResultsController.$inject = [];

	function ResultsController(){
		var ctrl = this;
    // I could not get this function to work in other controllers; left for reference
    ctrl.getCandidatePercentage = function (votes) {
      var total = _.sumBy(ctrl.candidates, "votes");
      if (total) {
          return (100 * (votes / total)).toFixed(2);
      }
      return 0;
    };
  }  // end ResultsController
})();  // end Results Component

//Vote Component
(function () {
  "use strict";

  angular.module("Election.Vote.Component", [])
    .component("tfElectionVote", {
      templateUrl: "App/Election.Vote.Component.Template.html",
      controller: VoteController,
      require: {
        parent: "^^tfElection",
      },
      bindings: {
        candidates: "<",
        onVote: "&",
        getCandidatePercentage: "&",
      }
    });

		VoteController.$inject = [];

		function VoteController(){
			var ctrl = this;
      // adds vote to candidate clicked on by user
      ctrl.castVote = function (candidate) {
          ctrl.onVote({ $candidate: candidate });
          // sort candidates into order after new vote cast
          ctrl.parent.sortCandidates();
      };
		}

})();

//Candidate Component
(function (angular) {
    "use strict";

    angular.module("Election.Candidate.Component", [])
    .component("tfElectionCandidate", {
      require: {
        parent: "^^tfElection"
      },
      templateUrl: "App/Election.Candidate.Component.Template.html",
      controller: CandidateController,
      bindings: {
        candidates: "<",
        onCandidateCreate: "&",
        onCandidateDelete: "&",
        getCandidatePercentage: "&",
      }
    });

		CandidateController.$inject = [];

		function CandidateController(){
			var ctrl = this,
      // this function runs when the controller runs
      buildNewCandidate = function() {
        return {
          votes: 0,
          name: "",
          color: null,
          percent: 0  // this is hardcoded since there are zero votes to start
        };
      };
      ctrl.newCandidate = null;
      // adds new candidate
      ctrl.addNewCandidate = function (candidate) {
        // alerts user if no candidate name entered
        if (candidate.name===""){
          alert('Please enter a candidate name.');
        } else {
          ctrl.parent.onCandidateCreate(candidate);
          ctrl.newCandidate = buildNewCandidate();
          ctrl.form.$setPristine();
        }
      };
      // deletes selected candidate
      ctrl.deleteCandidate = function (candidate) {
        ctrl.parent.onCandidateDelete({ $candidate: candidate });
      };
      // edits selected candidate
      ctrl.editCandidate = function (candidate) {
        var editedName = prompt("Make changes to your candidate's name.", candidate.name);
        candidate.name = editedName;
      };
      ctrl.candidateImage = function (candidate) {
        var candidateImg = prompt("Add a link to an image of your candidate.", candidate.image);
        candidate.image = candidateImg;
      };
      // $onInit is called once at component initialization
      ctrl.$onInit = function () {
          ctrl.newCandidate = buildNewCandidate();
      };
		}  // end CandidateController
})(window.angular);  // end Candidate Component
