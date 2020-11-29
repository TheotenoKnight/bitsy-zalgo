/* PALETTE TOOL */

// todo : localize
var PaletteColorDescriptions = [
	{ name: "textbox color", },
	{ name: "text color", },
	{ name: "rainbow color 1", },
	{ name: "rainbow color 2", },
	{ name: "rainbow color 3", },
	{ name: "rainbow color 4", },
	{ name: "rainbow color 5", },
	{ name: "rainbow color 6", },
	{ name: "rainbow color 7", },
	{ name: "rainbow color 8", },
	{ name: "rainbow color 9", },
	{ name: "rainbow color 10", },
	{ name: "transparent", },
	{
		name: "background color",
		title: "pick background color",
		icon: "room",
	},
	{
		name: "tile color",
		title: "pick tile color",
		icon: "tile",
	},
	{
		name: "sprite color",
		title: "pick sprite color",
		icon: "sprite",
	},
];

function PaletteTool(colorPicker, controls) {
	var self = this;

	var colorPickerIndex = 0;

	var curPaletteId = sortedIdList(palette)[0];

	controls.addButton.onclick = function() {
		var pal = palette[GetSelectedId()];
		var nextIndex = pal.colors.length;
		var shiftedIndex = color.ShiftedColorIndex(GetSelectedId(), nextIndex);
		pal.colors.push(color.GetDefaultColor(shiftedIndex).slice(0,3));
		colorPickerIndex = nextIndex;
		refreshGameData();
		initRoom(curRoom);
		UpdatePaletteUI();
	};

	controls.deleteButton.onclick = function() {
		var pal = palette[GetSelectedId()];
		pal.colors.pop();
		colorPickerIndex = pal.colors.length - 1;
		refreshGameData();
		initRoom(curRoom);
		UpdatePaletteUI();
	};

	function AppendColorSelectInput(form, index, shiftedIndex) {
		console.log("SHIFTED INDEX " + shiftedIndex);

		var description = shiftedIndex < PaletteColorDescriptions.length ?
			PaletteColorDescriptions[shiftedIndex] : null;

		var colorInput = document.createElement("input");
		colorInput.type = "radio";
		colorInput.name = "colorPalette";
		colorInput.id = "colorSelect_" + index;
		form.appendChild(colorInput);

		if (index === colorPickerIndex) {
			colorInput.checked = true;
		}

		colorInput.onclick = function() {
			changeColorPickerIndex(index);
		};

		var colorLabel = document.createElement("label");
		colorLabel.setAttribute("for", colorInput.id);
		form.appendChild(colorLabel);

		if (description && description.title) {
			colorLabel.title = description.title;
		}

		var iconSpan = iconUtils.CreateIcon(description && description.icon ? description.icon : "colors");
		iconSpan.classList.add("icon_space_right");
		colorLabel.appendChild(iconSpan);

		var textSpan = document.createElement("span");
		textSpan.innerText = description ? description.name : "color " + index; // todo : localize
		colorLabel.appendChild(textSpan);

		return colorLabel;
	}

	var labelElements = [];

	function UpdatePaletteUI() {
		// update name field
		var palettePlaceholderName = localization.GetStringOrFallback("palette_label", "palette");

		controls.nameInput.placeholder = palettePlaceholderName + " " + GetSelectedId() +
			" " + makeCountLabel(GetSelectedId(), palette, DEFAULT_REGISTRY_SIZE);

		var pal = palette[GetSelectedId()];

		if (pal && pal.name) {
			controls.nameInput.value = pal.name;
		}
		else {
			controls.nameInput.value = "";
		}

		labelElements = [];
		controls.colorSelectForm.innerHTML = "";

		for (var i = 0; i < pal.colors.length; i++) {
			var shiftedIndex = color.ShiftedColorIndex(GetSelectedId(), i);
			var label = AppendColorSelectInput(controls.colorSelectForm, i, shiftedIndex);
			labelElements.push(label);
		}

		updateColorPickerUI();

		if (DEFAULT_REGISTRY_SIZE != null && sortedIdList(palette).length >= (DEFAULT_REGISTRY_SIZE - 1)) {
			controls.addButton.disabled = true;
		}
		else {
			controls.addButton.disabled = false;
		}
	}

	events.Listen("game_data_change", function(event) {
		// make sure we have valid palette id
		if (palette[curPaletteId] === undefined) {
			if (sortedIdList(palette).length > 0) {
				curPaletteId = sortedIdList(palette)[0];
			}
			else {
				curPaletteId = null;
			}
		}

		UpdatePaletteUI();
	});

	// public
	function changeColorPickerIndex(index) {
		colorPickerIndex = index;
		var color = getPal(GetSelectedId())[ index ];
		// console.log(color);
		colorPicker.setColor( color[0], color[1], color[2] );
	}
	this.changeColorPickerIndex = changeColorPickerIndex;

	function updateColorPickerLabel(index, r, g, b) {
		var rgbColor = {r:r, g:g, b:b};

		var rgbColorStr = "rgb(" + rgbColor.r + "," + rgbColor.g + "," + rgbColor.b + ")";
		var hsvColor = RGBtoHSV(rgbColor);

		labelElements[index].style.background = rgbColorStr;
		labelElements[index].setAttribute("class", hsvColor.v < 0.5 ? "colorPaletteLabelDark" : "colorPaletteLabelLight");
	}

	this.GetBackgroundColor = function(index) {
		return labelElements[index].style.background;
	};

	this.GetStyle = function(index) {
		return labelElements[index].getAttribute("class");
	};

	// public
	function updateColorPickerUI() {
		var pal = palette[GetSelectedId()];

		for (var i = 0; i < pal.colors.length; i++) {
			var color = pal.colors[i];
			updateColorPickerLabel(i, color[0], color[1], color[2]);
		}

		changeColorPickerIndex(colorPickerIndex);
	}
	this.updateColorPickerUI = updateColorPickerUI;

	events.Listen("color_picker_change", function(event) {
		getPal(GetSelectedId())[ colorPickerIndex ][ 0 ] = event.rgbColor.r;
		getPal(GetSelectedId())[ colorPickerIndex ][ 1 ] = event.rgbColor.g;
		getPal(GetSelectedId())[ colorPickerIndex ][ 2 ] = event.rgbColor.b;

		updateColorPickerLabel(colorPickerIndex, event.rgbColor.r, event.rgbColor.g, event.rgbColor.b);

		if (event.isMouseUp && !events.IsEventActive("game_data_change")) {
			events.Raise("palette_change", { id: curPaletteId }); // TODO -- try including isMouseUp and see if we can update more stuff live
		}
	});

	function SelectPrev() {
		var idList = sortedIdList(palette);
		var index = idList.indexOf(curPaletteId);

		index--;
		if (index < 0) {
			index = idList.length - 1;
		}

		events.Raise("select_palette", { id: idList[index] });
	}
	this.SelectPrev = SelectPrev;

	this.SelectNext = function() {
		var idList = sortedIdList(palette);
		var index = idList.indexOf(curPaletteId);

		index++;
		if (index >= idList.length) {
			index = 0;
		}

		events.Raise("select_palette", { id: idList[index] });
	}

	this.AddNew = function() {
		// create new palette and save the data
		var id = nextB256Id(palette, 1, DEFAULT_REGISTRY_SIZE);

		if (id != null) {
			var randomColors = [
				hslToRgb(Math.random(), 1.0, 0.5),
				hslToRgb(Math.random(), 1.0, 0.5),
				hslToRgb(Math.random(), 1.0, 0.5) ];

			// todo : do I want this?
			if (flags.SECRET_COL === 1) {
				randomColors.push([0,0,0]);
				randomColors.push([255,255,255]);
			}

			palette[id] = createPalette(id, null, randomColors);

			events.Raise("add_palette", { id: id });
			events.Raise("select_palette", { id: id });
			events.Raise("palette_list_change");
		}
		else {
			alert("oh no you ran out of palettes! :(");
		}
	}

	this.AddDuplicate = function() {
		var id = nextB256Id(palette, 1, DEFAULT_REGISTRY_SIZE);

		if (id != null) {
			var sourcePalette = palette[curPaletteId] === undefined ? null : palette[curPaletteId];
			var curColors = sourcePalette.colors;

			var dupeColors = [];

			for (var i = 0; i < curColors.length; i++) {
				dupeColors.push(curColors[i].slice());
			}

			palette[id] = createPalette(id, null, dupeColors);

			events.Raise("add_palette", { id: id });
			events.Raise("select_palette", { id: id });
			events.Raise("palette_list_change");
		}
		else {
			alert("oh no you ran out of palettes! :(");
		}
	}

	this.DeleteSelected = function() {
		if (sortedIdList(palette).length <= 1) {
			alert("You can't delete your only palette!");
		}
		else if (confirm("Are you sure you want to delete this palette?")) {
			delete palette[curPaletteId];

			// replace palettes for rooms using the current palette
			var replacementPalId = sortedIdList(palette)[0];
			var roomIdList = sortedIdList(room);
			for (var i = 0; i < roomIdList.length; i++) {
				var roomId = roomIdList[i];
				if (room[roomId].pal === curPaletteId) {
					room[roomId].pal = replacementPalId;
				}
			}

			SelectPrev();

			events.Raise("delete_palette", { id: id });

			events.Raise("palette_list_change");
		}
	}

	function GetSelectedId() {
		return curPaletteId;
	}
	this.GetSelectedId = GetSelectedId;

	this.ChangeSelectedPaletteName = function(name) {
		var pal = palette[ GetSelectedId() ];

		if (pal) {
			if(name.length > 0) {
				pal.name = name;
			}
			else {
				pal.name = null;
			}

			events.Raise("change_palette_name", { id: pal.id, name: pal.name });
			events.Raise("palette_list_change");
		}
	}

	// init yourself
	UpdatePaletteUI();

	events.Listen("select_palette", function(e) {
		curPaletteId = e.id;
		UpdatePaletteUI();
	});
}