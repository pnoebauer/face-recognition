import React from 'react';
import './FaceRecognition.css';

const FaceRecognition = ( { imageUrl, box } ) => 
{
	return (
		<div className='center ma'>
			<div className='absolute mt2'>
				<img alt='' src={imageUrl} id='inputImage' width='500px' height='auto'/>
				{/*console.log(imageUrl)*/}
				<div className='bounding_box' style={{top: box.topRow, right: box.rightCol, bottom: box.bottomRow, left: box.leftCol }} ></div>
			</div>
		</div>
	)
};

export default FaceRecognition;