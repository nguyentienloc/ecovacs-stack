import { Feature } from 'ol';
import { Polygon } from 'ol/geom';
import VectorLayer from 'ol/layer/Vector';
import Projection from 'ol/proj/Projection';
import Vector from 'ol/source/Vector';
import VectorSource from 'ol/source/Vector';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import Style from 'ol/style/Style';
import Text from 'ol/style/Text';
import { FC, useContext, useEffect, useState } from 'react';

import { getMapSubsetsList, getSelectedRoomsList } from '../../../store/vacuum/mapSlice';
import getRandomColor from '../../../utils/colors.utils';
import { MapContext } from '../Map/MapContex';
import { getCoordinates, PixelRatio } from '../Map.utils';

export interface RoomsLayerProps {
  projection?: Projection;
  ZIndex?: number;
}
const RoomsLayer: FC<RoomsLayerProps> = ({ ZIndex }) => {
  const map = useContext(MapContext);
  const [roomsLayer] = useState<VectorLayer<VectorSource<Polygon>>>(new VectorLayer());
  const selectedRoomsList = getSelectedRoomsList();
  const mapSubsetsList = getMapSubsetsList();

  const isRoomSelected = (roomName: string) => {
    const mssid = +roomName.split(' ')[1];
    return selectedRoomsList?.find((current) => current === mssid) !== undefined;
  };

  useEffect(() => {
    if (!map) return;

    map.addLayer(roomsLayer);
    roomsLayer.setZIndex(ZIndex || 0);
    console.log('add roomsLayer');
    return () => {
      map && map.removeLayer(roomsLayer);
    };
  }, [map]);

  useEffect(() => {
    roomsLayer.setSource(
      new Vector({
        features: mapSubsetsList.map(({ value, mssid }) => {
          return new Feature({
            geometry: new Polygon([
              // need to add the PixelRatio as an offset to Y
              value.map((current) => [getCoordinates(+current[0], 'x'), getCoordinates(+current[1], 'y') + PixelRatio]),
            ]),
            name: `Room ${mssid}`,
          });
        }),
      }),
    );
  }, [mapSubsetsList]);

  useEffect(() => {
    roomsLayer
      .getSource()
      ?.getFeatures()
      .forEach((feature, index) =>
        feature.setStyle(
          new Style({
            stroke: new Stroke({
              color: getRandomColor(index, isRoomSelected(feature.get('name')) ? 0.8 : 0.6),
              width: 2,
            }),
            fill: new Fill({
              color: getRandomColor(index, isRoomSelected(feature.get('name')) ? 0.8 : 0.6),
            }),
            text: new Text({ text: feature.get('name') }),
          }),
        ),
      );
  }, [selectedRoomsList, roomsLayer?.getSource()]);

  return null;
};

export default RoomsLayer;
