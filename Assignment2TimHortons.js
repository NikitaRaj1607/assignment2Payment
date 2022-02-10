const Order = require("./Assignment2Order");

const OrderState = Object.freeze({
    WELCOMING:   Symbol("welcoming"),
    CHOICE:   Symbol("choice"),
    SANDWICH:   Symbol("sandwich"),
    ONSIDE:   Symbol("onside"),
    ICECREAM:  Symbol("icecream"),
    DRINKS:  Symbol("drinks"),
    PAYMENT: Symbol("payment")
});

module.exports = class TimHortonsOrder extends Order{
    constructor(sNumber, sUrl){
        super(sNumber, sUrl);
        this.stateCur = OrderState.WELCOMING;
        this.sSandwich = "";
        this.sChoice = "";
        this.sType = "";
        this.sIcecream = "";
        this.sDrinks = "";
        this.sOnside="";
    }

    totalprice(){
      var price=0;
      if (this.sSandwich) {
          price = price + 5;
      }
      if (this.sOnside) {
          price = price + 2;
      }
      if (this.sIcecream) {
        price = price + 1;
      }
      if (this.sDrinks.trim().toLowerCase() === "coffee") {
        price = price + 2;
      } else {
        price = price + 3;
      }
      price = price * 1.3;

      return price;
  }

    handleInput(sInput){
        let aReturn = [];
        switch(this.stateCur){
            case OrderState.WELCOMING:
                this.stateCur = OrderState.CHOICE;
                aReturn.push("Welcome to Nikita's Tim Hortons.");
                aReturn.push("What meal would you like to order - breakfast or lunch?");
                break;
            case OrderState.CHOICE:
                this.stateCur = OrderState.SANDWICH
                this.sChoice = sInput;
                aReturn.push("Which Sandwich would you like?");
                break;
            case OrderState.SANDWICH:
                this.stateCur = OrderState.sType
                this.sSandwich = sInput;
                aReturn.push(`What kind of bun on ${this.sSandwich} you would like?`);
                break;
            case OrderState.TYPE:
                if((sInput.toLowerCase() == "white") || (sInput.toLowerCase() == "whole wheat")){
                  this.stateCur = OrderState.ONSIDE
                  this.sType= sInput;
                  aReturn.push("would you like to have Donut on side?");
                }
                else{
                  aReturn.push(`${sInput} is not valid, please choose white or whole wheat`);
                }
                break;
            case OrderState.ONSIDE:
                this.stateCur = OrderState.ICECREAM
                this.sOnside= sInput;
                aReturn.push("Which Icecream would you like with that?");
                break;
            case OrderState.ICECREAM:
              if((sInput.toLowerCase() == "chocolate") || (sInput.toLowerCase() == "strawberry")){
                this.stateCur = OrderState.DRINKS
                this.sIcecream= sInput;
                aReturn.push("What would you like drinks with that?");
              }
              else{
                aReturn.push(`${sInput} is not valid, please choose chocolate or strawberry`);
              }
                break;
            case OrderState.DRINKS:
                if((sInput.toLowerCase() != "coffee") && (sInput.toLowerCase() != "fruit quenchers" ) && (sInput.toLowerCase() != "no" )){
                  aReturn.push(`${sInput} is not valid, please choose No coffee or fruit quenchers`);
                }
                else{
                  this.stateCur = OrderState.PAYMENT;
                  this.nOrder = this.totalprice();
                  if(sInput.toLowerCase() != "no"){
                      this.sDrinks = sInput;
                  }
                  aReturn.push("Thank-you for your order of");
                  aReturn.push(`${this.sSandwich} sandwich on ${this.sType} bun with ${this.sOnside}donut  and ${this.sIcecream} icecream`);
                  if(this.sDrinks){
                      aReturn.push(this.sDrinks);
                  }
                  aReturn.push(`Please pay for your order here`);
                  aReturn.push(`${this.sUrl}/payment/${this.sNumber}/`);
              }
                break;
            case OrderState.PAYMENT:
                console.log(sInput);
                console.log(sInput.purchase_units[0]);
                this.isDone(true);
                let d = new Date();
                d.setMinutes(d.getMinutes() + 20);
                aReturn.push(`Your order will be delivered  at ${sInput.purchase_units[0].shipping.address.address_line_1}
                              ${sInput.purchase_units[0].shipping.address.admin_area_1}
                              ${sInput.purchase_units[0].shipping.address.admin_area_2}
                              ${sInput.purchase_units[0].shipping.address.postal_code}
                              ${sInput.purchase_units[0].shipping.address.country_code}
                              at ${d.toTimeString()}`);
                break;
        }
        return aReturn;
    }
    renderForm(sTitle = "-1", sAmount = "-1"){
      // your client id should be kept private
      if(sTitle != "-1"){
        this.sItem = sTitle;
      }
      if(sAmount != "-1"){
        this.nOrder = sAmount;
      }
      const sClientID = process.env.SB_CLIENT_ID || 'put your client id here for testing ... Make sure that you delete it before committing'
      return(`
      <!DOCTYPE html>
  
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1"> <!-- Ensures optimal rendering on mobile devices. -->
        <meta http-equiv="X-UA-Compatible" content="IE=edge" /> <!-- Optimal Internet Explorer compatibility -->
      </head>
      
      <body>
        <script src="https://code.jquery.com/jquery-3.5.1.min.js"></script>
        <script
          src="https://www.paypal.com/sdk/js?client-id=${sClientID}"> // Required. Replace SB_CLIENT_ID with your sandbox client ID.
        </script>
        Thank you ${this.sNumber} for your ${this.sItem} order of $${this.nOrder}.
        <div id="paypal-button-container"></div>
  
        <script>
          paypal.Buttons({
              createOrder: function(data, actions) {
                // This function sets up the details of the transaction, including the amount and line item details.
                return actions.order.create({
                  purchase_units: [{
                    amount: {
                      value: '${this.nOrder}'
                    }
                  }]
                });
              },
              onApprove: function(data, actions) {
                // This function captures the funds from the transaction.
                return actions.order.capture().then(function(details) {
                  // This function shows a transaction success message to your buyer.
                  $.post(".", details, ()=>{
                    window.open("", "_self");
                    window.close(); 
                  });
                });
              }
          
            }).render('#paypal-button-container');
          // This function displays Smart Payment Buttons on your web page.
        </script>
      
      </body>
          
      `);
  
    }
}