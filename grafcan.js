var map;
require([
  "esri/map",
  "esri/arcgis/utils",
  "esri/SpatialReference",
  "esri/geometry/Extent",
  "esri/urlUtils",
  "esri/dijit/Geocoder",
  "esri/dijit/Legend",
  "dojo/domReady!"
  ], function(Map, arcgisUtils, SpatialReference, Extent, urlUtils){
  arcgisUtils.createMap("8eb5d173bca74ffaa2ca5bc928775fc4", "mapDiv").then(function (response) {
      map = response.map;   
      
      // Si recibimos una extensión por parámetros la establecemos
      if (location.search.length != 0){
        var extent = urlUtils.urlToObject(location.href).query.extent.split(",");

        var newExtent = new Extent(
          parseFloat(extent[0]), 
          parseFloat(extent[1]), 
          parseFloat(extent[2]), 
          parseFloat(extent[3]),
          new SpatialReference({wkid:4326})
        );
        map.setExtent(newExtent);
      }

      // Creamos y mostramos el widget de búqueda
      geocoder = new esri.dijit.Geocoder({
        map: map,
        autoComplete: true,
        arcgisGeocoder: {
          name: "Esri World Geocoder",
          suffix: " Redlands, CA"
        }
      },"search");
      geocoder.startup();

      //Mostramos la leyenda
      var legend = new esri.dijit.Legend({
          map: map,
          layerInfos:(arcgisUtils.getLegendLayers(response))
      }, "legendDiv");
      legend.startup();

      // Esta función muestra la(s) capa(s) WMS seleccionadas
      var mostrarCapas = function(service_url){
        var capas = map.getLayersVisibleAtScale();
        for(var i = 1; i < capas.length; i++){
          if(capas[i].url == service_url){
            // Fix para mostrar la ortofoto
            if(i==3 || i==4){
              capas[3].setVisibility(false);
              capas[3].imageFormat="image/jpeg"
              capas[3].setVisibility(true);
            }
            capas[i].setVisibility(true);
          }
          else{
            capas[i].setVisibility(false);
          }
          
          if(capas[3].url == service_url){
            dojo.style(dojo.byId("legendDiv"),"display","none")
            dojo.style(dojo.byId("SLContainer"),"display","none")
          }else{
            dojo.style(dojo.byId("legendDiv"),"display","block")
            dojo.style(dojo.byId("SLContainer"),"display","block")
          }
        }
      };

      // Asociamos el comportamiento a los 4 botones
      dojo.connect(dojo.byId('selectLayers'), "onchange", function(evt) {
         mostrarCapas(evt.target.value)
         dojo.stopEvent(evt);
      });

      // Asociamos el del botón de mostrar la leyenda
      dojo.connect(dojo.byId('showLegend'), "onclick", function(evt) {
         //debugger;
         if(dojo.style(dojo.byId("legendDiv"),"left") == "-300"){
           dojo.style(dojo.byId("legendDiv"),"left", "80px");
         }else{
           dojo.style(dojo.byId("legendDiv"),"left", "-300px");
         }
         dojo.stopEvent(evt);
      });

      // Si estamos en el toolmap hacemos accesible el mapa
      try{
        window.parent.map = response.map;   
      }catch(e){
          console.log("No estoy en el toolmap: http://esri-es.github.io/grafcan-wms-webmap/toolmap.html");
      }

  });

});