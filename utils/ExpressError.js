class ExpressError extends Error{
    constructor(statuscode,msg)
    {
        super();
        this.statuscode=statuscode;
        this.msg=msg;
    }
}
module.exports=ExpressError;