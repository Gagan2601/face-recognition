import React from "react";
import './FaceRecognition.css';
const FaceRecognition = ({ imageUrl, box}) => {
    return (
        <div className="center">
            <div className="absolute mt2">
                <img id='inputimage' src={imageUrl} alt="" width='500px' height='auto' />
                {box && Object.keys(box).map((key) => {
                    const faceLocation = box[key];
                    return (
                        <div
                            key={key}
                            className='bounding-box'
                            style={{
                                top: faceLocation.topRow,
                                right: faceLocation.rightCol,
                                bottom: faceLocation.bottomRow,
                                left: faceLocation.leftCol,
                            }}
                        ></div>
                    );
                })}
            </div>
        </div>
    )
}

export default FaceRecognition;