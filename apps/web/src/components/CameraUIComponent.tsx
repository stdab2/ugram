import { useRef, useState } from "react";
import { Camera as CameraPro, type CameraType } from "react-camera-pro";

interface CameraUIComponentProps {
	onCapture: (photo: string | ImageData) => void;
}

export default function CameraUIComponent({ onCapture }: CameraUIComponentProps) {
	const camera = useRef<CameraType | null>(null);
	const [hasCamera, setHasCamera] = useState(true);

	const handleTakePhoto = () => {
		const photo = camera.current?.takePhoto();
		if (photo) {
			onCapture(photo);
		}
	};

	return (
		<div className="relative h-full w-full overflow-hidden rounded-lg bg-black">
			<CameraPro
				ref={camera}
				numberOfCamerasCallback={(count) => {
					setHasCamera(count > 0);
				}}
				errorMessages={{
					noCameraAccessible: "No camera device accessible.",
					permissionDenied: "Permission denied.",
					switchCamera: "Cannot switch camera.",
					canvas: "Canvas is not supported.",
				}}
			/>

			{hasCamera && (
				<div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center gap-3">
					<button
						type="button"
						onClick={handleTakePhoto}
						className="rounded-full bg-white px-4 py-2 text-sm text-black"
					>
						Take photo
					</button>
				</div>
			)}
		</div>
	);
}
