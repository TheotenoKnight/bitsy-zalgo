function ConditionalEditor(conditionalExpression, parentEditor) {
	var self = this;

	var div = document.createElement("div");
	div.classList.add("conditionalEditor");
	div.classList.add("actionEditor");

	var orderControls = new OrderControls(this, parentEditor);
	div.appendChild(orderControls.GetElement());

	var titleDiv = document.createElement("div");
	titleDiv.classList.add("actionTitle");
	titleDiv.innerText = localization.GetStringOrFallback("branching_list_name", "branching list");
	div.appendChild(titleDiv);

	var descriptionDiv = document.createElement("div");
	descriptionDiv.classList.add("sequenceDescription"); // hack
	descriptionDiv.innerText = localization.GetStringOrFallback("branching_list_description", "go to the first branch whose condition is true:");
	div.appendChild(descriptionDiv);

	var optionRootDiv = document.createElement("div");
	optionRootDiv.classList.add("optionRoot");
	div.appendChild(optionRootDiv);

	var addConditionRootDiv = document.createElement("div");
	addConditionRootDiv.classList.add("addOption");
	addConditionRootDiv.style.flexDirection = "column"; //hack
	div.appendChild(addConditionRootDiv);

	var addButton = document.createElement("button");
	addButton.innerHTML = iconUtils.CreateIcon("add").outerHTML + " "
		+ localization.GetStringOrFallback("branch_add", "add branch");
	addButton.onclick = function() {
		addButton.style.display = "none";
		addItemCondition.style.display = "block";
		addVariableCondition.style.display = "block";
		addDefaultCondition.style.display = "block";
		cancelButton.style.display = "block";
	}
	addConditionRootDiv.appendChild(addButton);

	var addItemCondition = document.createElement("button");
	addItemCondition.innerHTML = iconUtils.CreateIcon("add").outerHTML + " "
		+ localization.GetStringOrFallback("branch_type_item", "item branch");
	addItemCondition.style.display = "none";
	addItemCondition.onclick = function() {
		var conditionPairNode = scriptUtils.CreateItemConditionPair();
		var optionEditor = new ConditionalOptionEditor(conditionPairNode, self, optionEditors.length);
		optionEditors.push(optionEditor);

		RefreshOptionsUI();
		UpdateNodeOptions();
		parentEditor.NotifyUpdate();

		addButton.style.display = "block";
		addItemCondition.style.display = "none";
		addVariableCondition.style.display = "none";
		addDefaultCondition.style.display = "none";
		cancelButton.style.display = "none";
	}
	addConditionRootDiv.appendChild(addItemCondition);

	var addVariableCondition = document.createElement("button");
	addVariableCondition.innerHTML = iconUtils.CreateIcon("add").outerHTML + " "
		+ localization.GetStringOrFallback("branch_type_variable", "variable branch");
	addVariableCondition.style.display = "none";
	addVariableCondition.onclick = function() {
		var conditionPairNode = scriptUtils.CreateVariableConditionPair();
		var optionEditor = new ConditionalOptionEditor(conditionPairNode, self, optionEditors.length);
		optionEditors.push(optionEditor);

		RefreshOptionsUI();
		UpdateNodeOptions();
		parentEditor.NotifyUpdate();

		addButton.style.display = "block";
		addItemCondition.style.display = "none";
		addVariableCondition.style.display = "none";
		addDefaultCondition.style.display = "none";
		cancelButton.style.display = "none";
	}
	addConditionRootDiv.appendChild(addVariableCondition);

	var addDefaultCondition = document.createElement("button");
	addDefaultCondition.innerHTML = iconUtils.CreateIcon("add").outerHTML + " "
		+ localization.GetStringOrFallback("branch_type_default", "default branch");
	addDefaultCondition.style.display = "none";
	addDefaultCondition.onclick = function() {
		var conditionPairNode = scriptUtils.CreateDefaultConditionPair();
		var optionEditor = new ConditionalOptionEditor(conditionPairNode, self, optionEditors.length);
		optionEditors.push(optionEditor);

		RefreshOptionsUI();
		UpdateNodeOptions();
		parentEditor.NotifyUpdate();

		addButton.style.display = "block";
		addItemCondition.style.display = "none";
		addVariableCondition.style.display = "none";
		addDefaultCondition.style.display = "none";
		cancelButton.style.display = "none";
	}
	addConditionRootDiv.appendChild(addDefaultCondition);

	var cancelButton = document.createElement("button");
	cancelButton.classList.add("actionBuilderButton");
	cancelButton.classList.add("actionBuilderCancel");
	cancelButton.innerHTML = iconUtils.CreateIcon("cancel").outerHTML + " "
		+ localization.GetStringOrFallback("action_cancel", "cancel");;
	cancelButton.style.display = "none";
	cancelButton.onclick = function() {
		addButton.style.display = "block";
		addItemCondition.style.display = "none";
		addVariableCondition.style.display = "none";
		addDefaultCondition.style.display = "none";
		cancelButton.style.display = "none";
	}
	addConditionRootDiv.appendChild(cancelButton);

	this.GetElement = function() {
		return div;
	}

	AddSelectionBehavior(this);

	this.GetNodes = function() {
		return [node];
	}

	this.NotifyUpdate = function() {
		UpdateNodeOptions();
		parentEditor.NotifyUpdate();
	}

	this.OpenExpressionBuilder = function(expressionString, onAcceptHandler) {
		parentEditor.OpenExpressionBuilder(expressionString, onAcceptHandler);
	}

	this.RemoveChild = function(childEditor) {
		optionEditors.splice(optionEditors.indexOf(childEditor),1);

		RefreshOptionsUI();
		UpdateNodeOptions();
		parentEditor.NotifyUpdate();
	}

	this.IndexOfChild = function(childEditor) {
		return optionEditors.indexOf(childEditor);
	}

	this.InsertChild = function(childEditor, index) {
		optionEditors.splice(index, 0, childEditor);

		RefreshOptionsUI();
		UpdateNodeOptions();
		parentEditor.NotifyUpdate();
	}

	this.ChildCount = function() {
		return optionEditors.length;
	}

	var optionEditors = [];
	function CreateOptionEditors() {
		optionEditors = [];

		for (var i = 1; i < conditionalExpression.list.length; i += 2) {
			var conditionPair = conditionalExpression.list.slice(i, (i + 1) < conditionalExpression.list.length ? (i + 2) : (i + 1));
			var optionEditor = new ConditionalOptionEditor(conditionPair, self, i - 1);
			optionRootDiv.appendChild(optionEditor.GetElement());
			optionEditors.push(optionEditor);
		}
	}

	function RefreshOptionsUI() {
		optionRootDiv.innerHTML = "";
		for (var i = 0; i < optionEditors.length; i++) {
			var editor = optionEditors[i];
			editor.UpdateIndex(i);
			optionRootDiv.appendChild(editor.GetElement());
		}
	}

	// TODO : share w/ sequence editor?
	function UpdateNodeOptions() {
		// todo : reimplement
		// var updatedOptions = [];

		// for (var i = 0; i < optionEditors.length; i++) {
		// 	var editor = optionEditors[i];
		// 	updatedOptions = updatedOptions.concat(editor.GetNodes());
		// }

		// conditionalNode.SetChildren(updatedOptions);
	}

	CreateOptionEditors();

	this.OnNodeEnter = function(event) {
		if (event.id === node.GetId()) {
			div.classList.add("executing");
		}

		for (var i = 0; i < optionEditors.length; i++) {
			if (optionEditors[i].OnNodeEnter) {
				optionEditors[i].OnNodeEnter(event);
			}
		}
	};

	this.OnNodeExit = function(event) {
		if (event.id === node.GetId() || event.forceClear) {
			div.classList.remove("executing");
			div.classList.remove("executingLeave");
			void div.offsetWidth; // hack to force reflow to allow animation to restart
			div.classList.add("executingLeave");
			setTimeout(function() { div.classList.remove("executingLeave") }, 1100);
		}

		for (var i = 0; i < optionEditors.length; i++) {
			if (optionEditors[i].OnNodeExit) {
				optionEditors[i].OnNodeExit(event);
			}
		}
	};
}

function ConditionalOptionEditor(conditionPair, parentEditor, index) {
	var div = document.createElement("div");
	div.classList.add("optionEditor");

	var topControlsDiv = document.createElement("div");
	topControlsDiv.classList.add("optionControls");
	div.appendChild(topControlsDiv);

	var orderControls = new OrderControls(this, parentEditor);
	topControlsDiv.appendChild(orderControls.GetElement());

	// condition
	var comparisonExpression = conditionPair.length >= 2 ? conditionPair[0] : null;
	var comparisonEditor = new ConditionalComparisonEditor(comparisonExpression, this, index);
	div.appendChild(comparisonEditor.GetElement());

	// result
	var resultExpression = conditionPair.length >= 2 ? conditionPair[1] : conditionPair[0];
	var resultEditor = createExpressionEditor(resultExpression, this);
	div.appendChild(resultEditor.GetElement());

	this.GetElement = function() {
		return div;
	}

	this.GetNodes = function() {
		return conditionPair;
	}

	this.NotifyUpdate = function() {
		// TODO : reimplement

		// var updatedChildren = comparisonEditor.GetNodes().concat(resultBlockEditor.GetNodes());
		// conditionPairNode.SetChildren(updatedChildren);

		// parentEditor.NotifyUpdate();
	}

	this.OpenExpressionBuilder = function(expressionString, onAcceptHandler) {
		parentEditor.OpenExpressionBuilder(expressionString, onAcceptHandler);
	}

	this.UpdateIndex = function(i) {
		index = i;
		comparisonEditor.UpdateIndex(index);
	}

	// just pass these on
	this.OnNodeEnter = function(event) {
		resultEditor.OnNodeEnter(event);
	}

	this.OnNodeExit = function(event) {
		resultEditor.OnNodeExit(event);
	}

	AddSelectionBehavior(
		this,
		function() { comparisonEditor.Select(); },
		function() { comparisonEditor.Deselect(); });
}

function ConditionalComparisonEditor(conditionExpression, parentEditor, index) {
	var self = this;

	var conditionStartSpan;
	var conditionEndSpan;
	var conditionExpressionEditor = null;

	var div = document.createElement("div");
	div.classList.add("conditionalComparisonEditor");

	function CreateComparisonControls() { // TODO : isEditable?
		div.innerHTML = "";

		conditionStartSpan = document.createElement("span");
		if (conditionExpression === null) {
			conditionStartSpan.innerText = localization.GetStringOrFallback("condition_else_label", "else");
		}
		else if (index === 0) {
			conditionStartSpan.innerText = localization.GetStringOrFallback("condition_if_label", "if") + " ";
		}
		else {
			conditionStartSpan.innerText = localization.GetStringOrFallback("condition_else_if_label", "else if") + " ";
		}
		div.appendChild(conditionStartSpan);

		// todo : what about just a value as the condition? etc...
		if (conditionExpression != null) {
			// todo : re-implement
			conditionExpressionEditor = new FunctionEditor(conditionExpression, self, true); // new ExpressionEditor(conditionNode, self, true);
			div.appendChild(conditionExpressionEditor.GetElement());
		}

		conditionEndSpan = document.createElement("span");
		if (conditionExpression != null) {
			conditionEndSpan.innerText = ", " + localization.GetStringOrFallback("condition_then_label", "then") + ":";
		}
		else {
			conditionEndSpan.innerText = ":";
		}
		div.appendChild(conditionEndSpan);
	}

	CreateComparisonControls();

	this.GetElement = function() {
		return div;
	}

	this.GetNodes = function() {
		// TODO : reimplement
		return [];


		// if (conditionNode.type === "else") {
		// 	return [conditionNode];
		// }
		// else {
		// 	return conditionExpressionEditor.GetNodes();
		// }
	}

	this.UpdateIndex = function(i) {
		// TODO : reimplement


		// index = i;

		// // update the initial label based on the order of the option
		// if (conditionNode.type != "else") {
		// 	if (index === 0) {
		// 		conditionStartSpan.innerText = localization.GetStringOrFallback("condition_if_label", "if") + " ";
		// 	}
		// 	else {
		// 		conditionStartSpan.innerText = localization.GetStringOrFallback("condition_else_if_label", "else if") + " ";
		// 	}
		// }
	}

	this.Select = function() {
		if (conditionExpressionEditor != null) {
			conditionExpressionEditor.Select();
		}
	}

	this.Deselect = function() {
		if (conditionExpressionEditor != null) {
			conditionExpressionEditor.Deselect();
		}
	}

	this.NotifyUpdate = function() {
		parentEditor.NotifyUpdate();
	}

	this.OpenExpressionBuilder = function(expressionString, onAcceptHandler) {
		parentEditor.OpenExpressionBuilder(expressionString, onAcceptHandler);
	}
}