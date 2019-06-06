module.exports = function Client(){
    this.actions = [];
    this.setApiKey = () => true;
    this.send = (msg) => this.actions.push(msg.dynamic_template_data.action);
};
