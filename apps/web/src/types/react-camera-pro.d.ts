declare module "react-camera-pro" {
	import type * as React from "react";

	export interface CameraType {
		takePhoto: () => string | undefined;
	}

	export interface CameraProps {
		numberOfCamerasCallback?: (count: number) => void;
		errorMessages?: {
			noCameraAccessible?: string;
			permissionDenied?: string;
			switchCamera?: string;
			canvas?: string;
		};
	}

	export const Camera: React.ForwardRefExoticComponent<
		CameraProps & React.RefAttributes<CameraType>
	>;
}
