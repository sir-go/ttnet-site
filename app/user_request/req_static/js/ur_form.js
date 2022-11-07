//noinspection JSUnusedAssignment
var $ = $ || function () {
    console.warn("jquery isn't included")
};

$(function () {
    var
        doc = $(document),
        ddata = $('#ddata'),
        ddata_sg = {},
        checkbox_internet = $('input[value="internet"]'),
        services = $('#services'),
        sale_caption = $('.t-price'),
        address_field = $("#address"),
        contacts_field = $("#contacts"),
        remark_field = $("#remark"),
        remark_len_caption = $('#remark_len'),
        remark_limit = parseInt(remark_field.attr('maxlength')),
        remark_default_ph = remark_field.prop('placeholder'),

        geo_info = $('#geo_info'),
        geo_lat = $('#geo_lat'),
        geo_lon = $('#geo_lon'),
        geo_zoom = $('#geo_zoom'),
        geo_q = $('#geo_q'),

        map_el = $('#map')
    ;

    checkbox_internet.focus();

    function set_field_validate(field, valid) {
        var
            ctl = field.closest('.form-control'),
            ctl_caption = ctl.find('.invalid')
        ;
        if (valid) {
            ctl_caption.hide();
            ctl.removeClass('fctl-warning');
        } else {
            ctl_caption.show();
            if (ctl_caption.text().length > 0)
                ctl.addClass('fctl-warning');
        }
    }

    function have_checked_service() {
        return services.find("input:checkbox:checked").length > 0;
    }

    function set_remark_ph() {
        var any_service_is_selected = have_checked_service();

        set_field_validate(
            remark_field,
            (remark_field.val().trim().length > 0) || any_service_is_selected);

        remark_field.attr("placeholder", any_service_is_selected ?
            'прочие пожелания' : remark_default_ph);
    }

    checkbox_internet.change(function () {
        sale_caption.css('visibility', this.checked ? 'visible' : 'hidden');
        set_remark_ph();
    });

    services.find("input:checkbox").change(set_remark_ph);

    //noinspection JSUnresolvedFunction
    remark_field.keyup(function () {
        var
            l = $(this).val().length,
            bad_length = (l === 0) || (l === remark_limit)
        ;

        remark_len_caption
            .toggleClass('lbl-warn', bad_length)
            .toggleClass('lbl-calm', !bad_length)
            .text(l > 0 ? l + '/' + remark_limit : '');

        set_remark_ph();
    });

    //noinspection JSUnresolvedFunction
    contacts_field.keyup(function () {
        set_field_validate(contacts_field, contacts_field.val().trim().length > 0)
    });

    const coordinate_between_tih_n_kor = [45.70579437540177, 39.803297745007455];
    var
        yMap,
        yMapState = 'none',
        place_mark,
        geo = {
            quality: geo_q.val() || 'none', // none, near, manual, exact
            coordinates: [
                parseFloat(geo_lat.val()),
                parseFloat(geo_lon.val())
            ],
            zoom: parseInt(geo_zoom.val())
        },
        mapCancelButton,
        mapDoneButton,
        mapResetButton,
        mapCenterMarkerButton,
        fias_zoom = {
            0: 5,   // страна
            1: 7,   // регион
            3: 9,   // район
            4: 14,  // город
            5: 15,  // район города
            6: 15,  // населенный пункт
            7: 16,  // улица
            8: 17,  // дом
            90: 15, // доп. территория
            91: 16  // улица в доп. территории
            // -1: 16 - иностранный или пустой
        }
    ;

    var
        alert_msg_house = 'Вы не указали номер дома',

        alert_msg_set = 'пожалуйста, <span class="link-span">укажите на карте' +
            '</span> точное расположение дома',

        alert_msg_map = ''
        // alert_msg_map = 'переместите указатель на дом и нажмите ' +
        //     '<samp class="btn done">Готово</samp> или ' +
        //     '<samp class="btn cancel">Отмена</samp>, если передумали'
    ;

    doc.on('click', '.link-span', map_init);

    function make_edit_msg() {
        var coords_msg = 'координаты: ['
            + geo.coordinates[0].toFixed(4) + ',' + geo.coordinates[1].toFixed(4)
            + ']';
        return $('<samp class="coord">' + coords_msg + '</samp>, ' +
            '<span class="link-span">изменить</span> ')
    }

    function update_geo(init) {
        var address_icon = address_field.parent().find('.fa');

        if (!init) {
            geo_q.val(geo.quality);
            geo_lat.val(geo.coordinates[0]);
            geo_lon.val(geo.coordinates[1]);
            geo_zoom.val(geo.zoom);
        }

        // console.log(ddata_sg.house, geo.quality);
        switch (geo.quality) {
            case 'near':
            case 'manual':
                if (yMapState !== 'showed') {
                    geo_info.html(
                        ddata_sg.house
                            ? (geo.quality === 'near'
                                ? alert_msg_set
                                : make_edit_msg())
                            : alert_msg_house
                    );
                } else {
                    map_init();
                }
                geo_info.show();
                address_icon.removeClass('fa-house').addClass('fa-map-marker');
                break;

            case 'none':
                if (address_field.val().trim().length > 0) {
                    if (yMapState !== 'showed') {
                        geo_info.html(ddata_sg.house ? alert_msg_set : alert_msg_house);
                    } else {
                        map_init();
                    }
                    geo_info.show();
                } else {
                    geo_info.hide();
                    map_hide();
                }
                address_icon.removeClass('fa-map-marker').addClass('fa-house');
                break;

            case 'exact':
                geo_info.html(make_edit_msg());
                geo_info.show();
                map_hide();
                address_icon.removeClass('fa-map-marker').addClass('fa-house');
                break
        }
    }

    //noinspection JSUnresolvedFunction
    address_field.suggestions({
        token: "217ad0e68052d8406a2a5259240fed790a8e7c2b",
        type: "ADDRESS",
        count: 10,
        geoLocation: false,
        addon: "clear",
        restrict_value: true,
        constraints: [
            {
                label: "",
                locations: [
                    {
                        region: "Краснодарский",
                        area: "Тихорецкий"
                    },
                    {
                        region: "Краснодарский",
                        area: "Кореновский"
                    },
                    {
                        region: "Краснодарский",
                        area: "Новопокровский"
                    }
                ]
            }
        ],

        onSelect: function (sg) {

            // console.log(sg.data);

            //noinspection JSUnresolvedVariable
            ddata_sg = {
                fias_id: sg.data.fias_id,
                zip: sg.data.postal_code,
                country: sg.data.country,
                region: sg.data.region,
                region_type: sg.data.region_type,
                area: sg.data.area,
                area_type: sg.data.area_type,
                city: sg.data.city || sg.data.settlement,
                city_type: sg.data.city_type || sg.data.settlement_type,
                street: sg.data.street,
                street_type: sg.data.street_type,
                house: sg.data.house,
                house_type: sg.data.house_type,
                flat: sg.data.flat,
                flat_type: sg.data.flat_type
            };

            ddata.val(JSON.stringify(ddata_sg));

            //noinspection JSUnresolvedVariable
            var sg_addr = [
                sg.data.region_with_type,
                sg.data.area_with_type,
                sg.data.city_with_type || sg.data.settlement_with_type,
                sg.data.street_with_type,
                sg.data.house
            ].join(', ');

            //noinspection JSUnresolvedVariable
            ymaps.geocode(sg_addr, {results: 1})
                .then(function (res) {
                    // console.log(sg_addr);

                    //noinspection JSUnresolvedVariable
                    var
                        found = res.geoObjects.get(0),
                        zoom_lvl = sg.data.fias_level < 0 ? 16 : fias_zoom[sg.data.fias_level] || 16,

                        res_kind = found.properties.get('metaDataProperty.GeocoderMetaData.kind'),
                        res_precision = found.properties.get('metaDataProperty.GeocoderMetaData.precision')
                    ;

                    //noinspection JSUnresolvedFunction,JSUnresolvedVariable
                    geo.coordinates = found.geometry.getCoordinates();
                    geo.zoom = zoom_lvl;
                    geo.quality = (res_kind === 'house' && res_precision === 'exact') ? 'exact' : 'near';

                    update_geo();
                });
        },

        onSelectNothing: clear_address
    }).on('suggestions-clear', clear_address);

    function map_hide(isDone) {
        if (yMapState === 'showed') {
            map_el.hide();
            yMapState = 'hidden';
        }
        if (isDone) update_geo();
    }

    function clear_address() {
        geo = {
            quality: 'none',
            coordinates: [NaN, NaN],
            zoom: NaN
        };
        update_geo();
    }

    function map_pick_done() {
        //noinspection JSUnresolvedVariable,JSUnresolvedFunction
        geo = {
            quality: 'manual',
            coordinates: place_mark.geometry.getCoordinates(),
            zoom: yMap.getZoom()
        };
        map_hide(true);
    }

    doc.on('click', 'samp.done', map_pick_done);
    doc.on('click', 'samp.cancel', map_hide);

    function map_init() {
        geo_info.html(alert_msg_map);

        if (isNaN(geo.coordinates[0]) || isNaN(geo.coordinates[1])) {
            geo.coordinates = coordinate_between_tih_n_kor
        }

        if (isNaN(geo.zoom)) {
            geo.zoom = 9
        }

        // the Map doesn't exist yet
        if (yMapState === 'none') {

            // the Map

            //noinspection JSUnresolvedVariable,JSUnresolvedFunction
            yMap = new ymaps.Map("map", {
                type: 'yandex#hybrid',
                center: geo.coordinates,
                zoom: geo.zoom,
                controls: [
                    'zoomControl',
                    'typeSelector'
                ]
            });

            yMap.controls.get('typeSelector').options.set(
                'position', {'top': 50, 'right': 10}
            );

            yMap.events.add('actionbegin', function () {
                mapResetButton.options.set('visible', true);
                mapCenterMarkerButton.options.set('visible', true);
            });


            // placemark

            //noinspection JSUnresolvedVariable,JSUnresolvedFunction
            place_mark = new ymaps.Placemark(geo.coordinates,
                {iconCaption: "перетащите на дом"},
                {
                    draggable: true,
                    // preset: 'islands#blueDotIcon',
                    preset: 'islands#violetDotIconWithCaption'
                    // hasBalloon: false,
                    // hasHint: false,
                }
            );
            place_mark.events.add('dragend', function () {
                //noinspection JSUnresolvedVariable
                place_mark.properties.set('iconCaption', 'здесь');
                mapResetButton.options.set('visible', true);
                mapCenterMarkerButton.options.set('visible', true);
            });
            //noinspection JSUnresolvedVariable
            yMap.geoObjects.add(place_mark);

            // Cancel button

            //noinspection JSUnresolvedVariable,JSUnresolvedFunction
            mapCancelButton = new ymaps.control.Button({
                data: {
                    content: '<span class="ymap-cancel-btn"><i class="fa fa-close"></i> Отмена</span>',
                    title: 'Закрыть карту'
                },
                options: {
                    minWidth: 130,
                    maxWidth: 130,
                    selectOnClick: false
                }
            });
            mapCancelButton.events.add('press', map_hide);
            yMap.controls.add(mapCancelButton, {
                float: 'right',
                floatIndex: 100
            });

            // Done button

            //noinspection JSUnresolvedVariable,JSUnresolvedFunction
            mapDoneButton = new ymaps.control.Button({
                data: {
                    content: '<div class="ymap-done-btn"><i class="fa fa-check"></i> Готово</div>',
                    title: 'Подтвердить выбранные координаты'
                },
                options: {
                    width: 87,
                    maxWidth: 130,
                    selectOnClick: false
                }
            });
            mapDoneButton.events.add('press', map_pick_done);
            yMap.controls.add(mapDoneButton, {float: 'left', floatIndex: 102});

            // Reset button

            //noinspection JSUnresolvedVariable,JSUnresolvedFunction
            mapResetButton = new ymaps.control.Button({
                data: {
                    content: '<i class="fa fa-undo"></i> Сбросить',
                    title: 'Вернуть исходное состояние карты'
                },
                options: {
                    maxWidth: 130,
                    selectOnClick: false,
                    visible: false
                }
            });
            mapResetButton.events.add('press', map_init);
            yMap.controls.add(mapResetButton, {
                float: 'left',
                floatIndex: 101
            });

            // MarkerToCenter button

            //noinspection JSUnresolvedVariable,JSUnresolvedFunction
            mapCenterMarkerButton = new ymaps.control.Button({
                data: {
                    content: '<i class="fa fa-map-marker"></i> Указатель',
                    title: 'Переместить указатель в центр видимой область карты'
                },
                options: {
                    selectOnClick: false,
                    visible: false,
                    maxWidth: 130
                }
            });
            mapCenterMarkerButton.events.add('press', function () {
                //noinspection JSUnresolvedVariable,JSUnresolvedFunction
                place_mark.geometry.setCoordinates(yMap.getCenter());
                mapCenterMarkerButton.options.set('visible', false);
            });
            yMap.controls.add(mapCenterMarkerButton, {
                float: 'left',
                floatIndex: 100
            });

            // the Map already exists
        } else {
            //noinspection JSUnresolvedFunction
            yMap.setCenter(geo.coordinates, geo.zoom);

            //noinspection JSUnresolvedVariable,JSUnresolvedFunction
            place_mark.geometry.setCoordinates(geo.coordinates);
            mapResetButton.options.set('visible', false);
            mapCenterMarkerButton.options.set('visible', false);
        }

        map_el.show();
        yMapState = 'showed';

        geo_info.html(alert_msg_map);
    }

    update_geo(true);
});
