
CREATE TABLE admins (
  user_id INT  PRIMARY KEY,
  email VARCHAR(100) NOT NULL,
  password VARCHAR(100) NOT NULL,
  name VARCHAR(100)
) 

CREATE TABLE dinoussaur_ticket (
  ticket_id INT PRIMARY KEY,
  dinossaur VARCHAR(100) NOT NULL, 
  description VARCHAR(200) NOT NULL, 
  type VARCHAR(100),      
  price DECIMAL(8,2) NOT NULL,        

) 

CREATE TABLE reservation (
  user_id INT NOT NULL,
  reservation_id INT PRIMARY KEY,
  name_buyer VARCHAR(100) NOT NULL, 
  buyer_email VARCHAR(100) NOT NULL, 
  date DATE NOT NULL, 
  quantity INT NOT NULL,
  ticket_id INT NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,    
  payment VARCHAR(50),
  FOREIGN KEY (user_id),
  FOREIGN KEY (ticket_id)

) 

