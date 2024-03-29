import React from 'react';
import './FaceRecognition.css';

const FaceRecognition = ({imageUrl, boxes}) => {
	return (
		<div className='center ma'>
			<div className='absolute mt2'>
				<img alt='' src={imageUrl} id='inputImage' width='500px' height='auto' />
				{boxes.map((box, index) => (
					<div
						className='bounding_box'
						key={index}
						style={{
							top: box.topRow,
							right: box.rightCol,
							bottom: box.bottomRow,
							left: box.leftCol,
						}}
					/>
				))}
			</div>
		</div>
	);
};

export default FaceRecognition;
