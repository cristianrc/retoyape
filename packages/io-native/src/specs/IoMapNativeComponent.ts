import type { ViewProps, HostComponent, CodegenTypes } from 'react-native';
import { codegenNativeComponent } from 'react-native';

export type Marker = Readonly<{
  id: string;
  title: string;
  latitude: CodegenTypes.Double;
  longitude: CodegenTypes.Double;
}>;

export interface NativeProps extends ViewProps {
  markers: ReadonlyArray<Marker>;
  selectedMarkerId: string;
  cameraResetKey?: CodegenTypes.WithDefault<CodegenTypes.Int32, 0>;
  onMarkerPress?: CodegenTypes.DirectEventHandler<
    Readonly<{ markerId: string }>
  >;
  onMapReady?: CodegenTypes.DirectEventHandler<Readonly<{ ready: boolean }>>;
  onMapError?: CodegenTypes.DirectEventHandler<Readonly<{ code: string }>>;
}

export default codegenNativeComponent<NativeProps>(
  'IoMap',
) as HostComponent<NativeProps>;
