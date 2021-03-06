var tempCharJson;
var tempChar;
var tempSpLeft;
var tempLevel;
var tempUid;
var skillDiff = {};
var inRequest = false;

// From HTML
var statConfig;
var originalChar;
var readOnly;
var admin;
var urlPrefix;

function handleSkillButtons() {
	var anyPointSpent = false;
	$.each(tempChar.skills, function (skillType, skill) {
		$("#" + skillType + "Cost").text("(Next: " + skill.nextRankCost + ")");
		$("#" + skillType + "Spec1Cost").text("(Next: " + skill.nextSpec1RankCost + ")");
		$("#" + skillType + "Spec2Cost").text("(Next: " + skill.nextSpec2RankCost + ")");

		// We can afford a skill point, show plus butan
		if (skill.nextRankCost <= tempChar.spLeft) {
			$("#" + skillType + "Increment").removeClass("hidden");
		} else {
			$("#" + skillType + "Increment").addClass("hidden");
		}

		var tempSkill = skillDiff[skillType] || {};

		// We have spent a skill point, show minus butan and save and reset butans
		if (tempSkill.ranks || (admin && skill.ranks > 0)) {
			if (tempSkill.ranks) {
				anyPointSpent = true;
			}

			// Can't decrement a skill below spec level
			if ((statConfig.spec1Start === skill.ranks && skill.spec1Ranks)
							|| (statConfig.spec2Start === skill.ranks && skill.spec2Ranks)) {
				$("#" + skillType + "Decrement").addClass("hidden");
			} else {
				$("#" + skillType + "Decrement").removeClass("hidden");
			}
		} else {
			$("#" + skillType + "Decrement").addClass("hidden");
		}

		// We can afford a spec point, show plus butan
		if (
						skill.nextSpec1RankCost
						&& skill.nextSpec1RankCost <= tempChar.spLeft
						&& skill.spec1Ranks < skill.ranks) {

			if (skill.spec1Name || tempSkill.spec1Name) {
				$("#" + skillType + "Spec1Increment").removeClass("hidden");
			} else {
				$("#" + skillType + "Spec1Increment").addClass("hidden");
			}

			if (skill.spec1Available) {
				$("#" + skillType + "Spec1Name").removeClass("hidden");
			} else {
				$("#" + skillType + "Spec1Name").addClass("hidden");
			}
		} else {
			$("#" + skillType + "Spec1Increment").addClass("hidden");
			$("#" + skillType + "Spec1Name").addClass("hidden");
		}

		// Show costs for available spec
		if (skill.spec1Name || tempSkill.spec1Name) {
			$("#" + skillType + "Spec1Cost").removeClass("hidden");
		} else {
			$("#" + skillType + "Spec1Cost").addClass("hidden");
		}

		// We have spent a spec point, show minus butan
		if (tempSkill.spec1Ranks) {
			$("#" + skillType + "Spec1Decrement").removeClass("hidden");
			anyPointSpent = true;
		} else {
			$("#" + skillType + "Spec1Decrement").addClass("hidden");
		}

		// We can afford a spec point, show plus butan
		if (
						skill.nextSpec2RankCost
						&& skill.nextSpec2RankCost <= tempChar.spLeft
						&& skill.spec2Ranks < skill.ranks) {

			if (skill.spec2Name || tempSkill.spec2Name) {
				$("#" + skillType + "Spec2Increment").removeClass("hidden");
			} else {
				$("#" + skillType + "Spec2Increment").addClass("hidden");
			}

			if (skill.spec2Available) {
				$("#" + skillType + "Spec2Name").removeClass("hidden");
			} else {
				$("#" + skillType + "Spec2Name").addClass("hidden");
			}
		} else {
			$("#" + skillType + "Spec2Increment").addClass("hidden");
			$("#" + skillType + "Spec2Name").addClass("hidden");
		}

		// Show costs for available spec
		if (skill.spec2Name || tempSkill.spec2Name) {
			$("#" + skillType + "Spec2Cost").removeClass("hidden");
		} else {
			$("#" + skillType + "Spec2Cost").addClass("hidden");
		}

		// We have spent a spec point, show minus butan
		if (tempSkill.spec2Ranks) {
			$("#" + skillType + "Spec2Decrement").removeClass("hidden");
			anyPointSpent = true;
		} else {
			$("#" + skillType + "Spec2Decrement").addClass("hidden");
		}
	});

	if (anyPointSpent) {
		$("#save").removeClass("hidden");
		$("#reset").removeClass("hidden");
	} else {
		$("#save").addClass("hidden");
		$("#reset").addClass("hidden");
	}
}

function incrementSkill() {
	if (inRequest) {
		return false;
	}

	var skillType = $(this).attr("data-skill-type");
	if (!skillDiff[skillType])
		skillDiff[skillType] = {};
	var skill = skillDiff[skillType];

	var skillField = $(this).attr("data-skill-field");
	if (!skill[skillField])
		skill[skillField] = 0;
	skill[skillField]++;
	recalcStats();
}

function decrementSkill() {
	if (inRequest) {
		return false;
	}

	var skillType = $(this).attr("data-skill-type");
	if (!skillDiff[skillType])
		skillDiff[skillType] = {};
	var skill = skillDiff[skillType];

	var skillField = $(this).attr("data-skill-field");
	if (!skill[skillField])
		skill[skillField] = 0;
	skillDiff[skillType][skillField]--;
	recalcStats();
}

function nameSkill() {
	var skillType = $(this).attr("data-skill-type");
	if (!skillDiff[skillType])
		skillDiff[skillType] = {};
	var skill = skillDiff[skillType];

	var skillField = $(this).attr("data-skill-field");

	var name = $(this).val();
	skill[skillField] = name;
	handleSkillButtons();
}

function updateLevel() {
	var newLevel = $(this).val();
	if (newLevel !== tempLevel) {
		tempLevel = newLevel;
		recalcStats();
	}
}

function loadCharacter() {
	var newUid = $(this).val();
	if (newUid === tempUid) {
		return;
	}

	if (newUid === "") {
		newUid = "~template~";
	}
	tempUid = newUid;

	$.ajax({
		url: urlPrefix + "/api/character/" + tempUid,
		type: "GET",
		dataType: "json",
		success: function (response) {
			tempChar = response;
			skillDiff = {};
			inRequest = false;
			redrawStats();
		}
	});
}

function recalcStats() {
	if (inRequest) {
		return;
	}
	inRequest = true;

	var reqObj = {skills:skillDiff};
	if (admin) {
		reqObj.userId = $("#uidInput").val();
		reqObj.name = $("#name").val();
		reqObj.level = $("#levelValue").val();
	}

	$.ajax({
		url: urlPrefix + "/api/statCheck",
		type: "POST",
		data: JSON.stringify(reqObj),
		contentType: "application/json; charset=utf-8",
		dataType: "json",
		success: function (response) {
			tempChar = response;
			inRequest = false;
			redrawStats();
		}
	});
}

function redrawStats() {
	// Redraw Vitals
	$("#name").text(tempChar.name);
	$("#name").val(tempChar.name);
	$("#levelValue").text(tempChar.level);
	$("#levelValue").val(tempChar.level);
	$("#hpCurrent").text(tempChar.hpCurrent);
	$("#hpMax").text(tempChar.hpMax);
	$("#mpCurrent").text(tempChar.mpCurrent);
	$("#mpMax").text(tempChar.mpMax);
	$("#spCurrent").text(tempChar.spUsed);
	$("#spMax").text(tempChar.spTotal);

	// Redraw stats
	$.each(tempChar.stats, function (statType, statValue) {
		if (statType === "int_") statType = "int";
		$("#" + statType + "Value").text(statValue);
	});

	// Redraw skills
	$.each(tempChar.skills, function (skillType, skill) {
		$("#" + skillType + "Value").text(skill.ranks);
		$("#" + skillType + "Cost").text(skill.nextRankCost);
		$("#" + skillType + "Spec1Label").text(skill.spec1Name);
		if (skill.spec1Name) {
			$("#" + skillType + "Spec1Label").removeClass("hidden");
			$("#" + skillType + "Spec1Ranks").removeClass("hidden");
		} else {
			$("#" + skillType + "Spec1Label").addClass("hidden");
			$("#" + skillType + "Spec1Ranks").addClass("hidden");
		}

		$("#" + skillType + "Spec1Ranks").text(skill.spec1Ranks);
		$("#" + skillType + "Spec1Cost").text(skill.nextSpec1RankCost);
		$("#" + skillType + "Spec2Label").text(skill.spec2Name);
		if (skill.spec2Name) {
			$("#" + skillType + "Spec2Label").removeClass("hidden");
			$("#" + skillType + "Spec2Ranks").removeClass("hidden");
		} else {
			$("#" + skillType + "Spec2Label").addClass("hidden");
			$("#" + skillType + "Spec2Ranks").addClass("hidden");
		}

		$("#" + skillType + "Spec2Ranks").text(skill.spec2Ranks);
		$("#" + skillType + "Spec2Cost").text(skill.nextSpec2RankCost);
	});

	handleSkillButtons();
}

function saveChar() {
	if (inRequest) {
		return;
	}
	inRequest = true;
	$("#save").attr("disabled", true);

	var reqObj = {skills:skillDiff};
	if (admin) {
		reqObj.userId = $("#uidInput").val();
		reqObj.name = $("#name").val();
		reqObj.level = $("#levelValue").val();
	}

	$.ajax({
		url: urlPrefix + "/api/character",
		type: "PUT",
		data: JSON.stringify(reqObj),
		contentType: "application/json; charset=utf-8",
		dataType: "json",
		success: function () {
			tempCharJson = JSON.stringify(tempChar);
			skillDiff = {};
			inRequest = false;
			$("#save").attr("disabled", false);
			handleSkillButtons();
		}
	});
}

function reset() {
	tempChar = JSON.parse(tempCharJson);
	skillDiff = {};
	recalcStats();
}

$(document).ready(function () {

	tempCharJson = JSON.stringify(originalChar);
	tempChar = JSON.parse(tempCharJson);
	tempLevel = tempChar.level;

	if (readOnly) {
		$.each(tempChar.skills, function (skillType, skill) {
			$("#" + skillType + "Cost").hide();
			$("#" + skillType + "Spec1Cost").hide();
			$("#" + skillType + "Spec2Cost").hide();
		});
		return;
	}

	$("input.dec").on("click", decrementSkill);
	$("input.inc").on("click", incrementSkill);
	$("input#save").on("click", saveChar);
	$("input#reset").on("click", reset);
	$("input.specName").on("blur", nameSkill);
	$("input#levelValue").on("blur", updateLevel);
	$("input#uidInput").on("blur", loadCharacter);
	// TODO: Make specialization name boxen red if they're empty onBlur, and apply them to the diff

	handleSkillButtons();
});
